from fastapi import FastAPI


app = FastAPI(title="crackSensingAiService AI Server")


@app.get("/health")
def health():
    return {"status": "UP"}
