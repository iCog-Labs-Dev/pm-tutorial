# backend/tests/test_app.py
import pytest
from flask import json
import app as app_module # your app.py
from app import app, code_history

# ——— Fixtures ————————————————————————————————

@pytest.fixture(autouse=True)
def clear_state():
    # Clear history before each test
    code_history.clear()
    

    # Stub out metta_session by replacing it with a dummy object
    
    yield
    # (no teardown needed)

@pytest.fixture
def client():
    # 1) Turn on “testing mode” in Flask
    app.config["TESTING"] = True

    # 2) Create the test client, yield it to your tests, then tear it down
    with app.test_client() as c:
        yield c

@pytest.fixture
def real_metta_session():
    from hyperon import MeTTa
    return MeTTa()



# ——— /run-metta ———————————————————————————————


def test_run_metta_real_engine(client, real_metta_session, monkeypatch):
    # swap in the real session
    monkeypatch.setattr(app_module, "metta_session", real_metta_session)

    payload = {
        "code": '!(+ 1 2)',       # some valid Metta expression
        "language": "metta",
        "codeId": "real1"
    }
    resp = client.post("/run-metta", json=payload)
    assert resp.status_code == 200

    data = resp.get_json()
    # if Metta returns something like "3", adapt this assertion accordingly:
    assert "[3]" in data["result"]
    assert data["codeId"] == "real1"
    assert data["historyLength"] == 1
    assert code_history == [{"id": "real1", "code": "!(+ 1 2)"}]

def test_run_metta_updates_existing_id(client,monkeypatch,real_metta_session):
    monkeypatch.setattr(app_module, "metta_session", real_metta_session)
    # first call
    client.post("/run-metta", json={"code": "!(+ 1 2)", "language": "metta", "codeId": "X"})
    # second call with same codeId should overwrite but not append
    resp = client.post("/run-metta", json={"code": "(+ 2 3)", "language": "metta", "codeId": "X"})
    data = resp.get_json()
    assert data["historyLength"] == 1
    assert code_history == [{"id": "X", "code": "(+ 2 3)"}]

@pytest.mark.parametrize(
    "payload,missing_field",
    [
        ({}, "code"),                                       #  completely empty JSON
        ({"code": "x"}, "language"),                        # language key missing
        ({"code": "x", "language": "wrong"}, "language"),   #  language present but wrong value
        ({"code": "x", "language": "metta"}, "codeId"),     # codeId missing
    ]
)
def test_run_metta_bad_requests(payload, missing_field, client,monkeypatch,real_metta_session):
    monkeypatch.setattr(app_module, "metta_session", real_metta_session)
    resp = client.post("/run-metta", json=payload)
    assert resp.status_code == 400
    data = resp.get_json()
    assert "error" in data

# ——— /reset-to-code ——————————————————————————————

def test_reset_to_code_empty_history(client):
    # should just be 200 and empty body
    resp = client.post("/reset-to-code", json={"codeId": "anything"})
    assert resp.status_code == 200
    assert resp.data == b""


def test_reset_to_code_not_found(client,monkeypatch,real_metta_session):
    monkeypatch.setattr(app_module, "metta_session", real_metta_session)
    # populate history with a different ID
    client.post("/run-metta", json={"code": "(A)", "language": "metta", "codeId": "Z"})
    resp = client.post("/reset-to-code", json={"codeId": "MISSING"})
    assert resp.status_code == 404
    assert "error" in resp.get_json()


def test_reset_to_code_success(client,monkeypatch,real_metta_session):
    monkeypatch.setattr(app_module,"metta_session",real_metta_session)
    # seed history
    client.post("/run-metta", json={"code": "!(A)", "language": "metta", "codeId": "1"})
    client.post("/run-metta", json={"code": "!(B)", "language": "metta", "codeId": "2"})
    # reset-to-code up to “two” (exclusive) should leave only the first entry
    resp = client.post("/reset-to-code", json={"codeId": '2'})
    assert resp.status_code == 200
    assert code_history == [{"id": "1", "code": "!(A)"}]

# ——— /reset-atomspace ——————————————————————————————

def test_reset_atomspace_clears_everything(client,monkeypatch,real_metta_session):
    monkeypatch.setattr(app_module,"metta_session",real_metta_session)
    # seed history
    client.post("/run-metta", json={"code": "(X)", "language": "metta", "codeId": "x"})
    resp = client.post("/reset-atomspace")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data == {"message": "AtomSpace and code history completely reset."}
    assert code_history == []


# ——— /get-history ——————————————————————————————

def test_get_history_empty(client):
    resp = client.get("/get-history")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data == {"history": [], "length": 0}


def test_get_history_after_runs(client,monkeypatch,real_metta_session):
    monkeypatch.setattr(app_module,"metta_session",real_metta_session)
    client.post("/run-metta", json={"code": "(C)", "language": "metta", "codeId": "c"})
    resp = client.get("/get-history")
    data = resp.get_json()
    assert data["length"] == 1
    assert data["history"][0]["id"] == "c"

# ——— /remove-code ——————————————————————————————

def test_remove_code_empty_history(client):
    resp = client.post("/remove-code", json={"codeId": "x"})
    assert resp.status_code == 200
    assert resp.data == b""


def test_remove_code_not_found(client,monkeypatch,real_metta_session):
    monkeypatch.setattr(app_module,"metta_session",real_metta_session)
    client.post("/run-metta", json={"code": "(X)", "language": "metta", "codeId": "x"})
    resp = client.post("/remove-code", json={"codeId": "missing"})
    assert resp.status_code == 404
    assert "error" in resp.get_json()


def test_remove_code_success(client,monkeypatch,real_metta_session):
    monkeypatch.setattr(app_module,"metta_session",real_metta_session)
    client.post("/run-metta", json={"code": "(one)",   "language": "metta", "codeId": "1"})
    client.post("/run-metta", json={"code": "(two)",   "language": "metta", "codeId": "2"})
    client.post("/run-metta", json={"code": "(three)", "language": "metta", "codeId": "3"})
    # remove “2” should drop 2 and 3, replay only “1”
    resp = client.post("/remove-code", json={"codeId": "2"})
    assert resp.status_code == 200
    assert code_history == [{"id": "1", "code": "(one)"}]