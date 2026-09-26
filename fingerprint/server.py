"""Prism fingerprint sidecar: LLMmap behind a tiny HTTP API.

POST /fingerprint {answers: [8 strings]} -> {top: [{model, distance}]}   (lower distance = closer)
POST /answer {questions, system}         -> {answers}  (Qwen2.5-0.5B-Instruct, the demo copycat's "brain")
GET  /health
"""
import os
import sys
import threading
from pathlib import Path

import numpy as np
import torch
from fastapi import FastAPI
from pydantic import BaseModel

HERE = Path(__file__).parent
LLMMAP_DIR = Path(os.environ.get("LLMMAP_DIR", HERE / "vendor" / "LLMmap"))
sys.path.insert(0, str(LLMMAP_DIR))
from LLMmap.inference import load_LLMmap  # noqa: E402

COPYCAT_MODEL = os.environ.get("COPYCAT_MODEL", "Qwen/Qwen2.5-0.5B-Instruct")

app = FastAPI(title="Prism fingerprint")
_conf, _llmmap = load_LLMmap(str(LLMMAP_DIR / "data" / "pretrained_models" / "default"))
_lm = None
_lm_lock = threading.Lock()


class FingerprintIn(BaseModel):
    answers: list[str]


class AnswerIn(BaseModel):
    questions: list[str]
    system: str = "You are a helpful assistant."


@app.get("/health")
def health():
    return {"ok": True, "queries": len(_conf["queries"]), "models": len(_llmmap.llms_supported)}


@app.post("/fingerprint")
def fingerprint(body: FingerprintIn):
    distances = _llmmap(body.answers)
    order = np.argsort(distances)[:5]
    return {"top": [{"model": _llmmap.label_map[int(i)], "distance": float(distances[i])} for i in order]}


def _copycat():
    global _lm
    with _lm_lock:
        if _lm is None:
            from transformers import AutoModelForCausalLM, AutoTokenizer

            tok = AutoTokenizer.from_pretrained(COPYCAT_MODEL)
            model = AutoModelForCausalLM.from_pretrained(COPYCAT_MODEL, torch_dtype=torch.float32)
            _lm = (tok, model)
    return _lm


@app.post("/answer")
def answer(body: AnswerIn):
    tok, model = _copycat()
    out = []
    for q in body.questions:
        msgs = [{"role": "system", "content": body.system}, {"role": "user", "content": q}]
        ids = tok.apply_chat_template(msgs, add_generation_prompt=True, return_tensors="pt")
        with torch.no_grad():
            gen = model.generate(ids, max_new_tokens=120, do_sample=False)
        out.append(tok.decode(gen[0][ids.shape[1]:], skip_special_tokens=True))
    return {"answers": out}
