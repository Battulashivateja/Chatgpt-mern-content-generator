import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

const TYPES = [
  { value: "blog", label: "Blog post" },
  { value: "email", label: "Email" },
  { value: "social", label: "Social media post" },
  { value: "product", label: "Product description" },
];
const TONES = ["professional", "friendly", "persuasive", "casual", "formal"];

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("blog");
  const [tone, setTone] = useState("professional");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API}/api/history`);
      setHistory(await res.json());
    } catch {
      /* history is optional */
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch(`${API}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type, tone }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
      loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const remove = async (id) => {
    await fetch(`${API}/api/history/${id}`, { method: "DELETE" });
    setHistory((h) => h.filter((item) => item._id !== id));
  };

  const open = (item) => {
    setPrompt(item.prompt);
    setType(item.type);
    setTone(item.tone);
    setOutput(item.output);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page">
      <header>
        <h1>Write it with AI</h1>
        <p>Describe what you need, pick a format and tone, and watch it get written.</p>
      </header>

      <main>
        <form onSubmit={generate} className="panel">
          <label htmlFor="prompt">What should it be about?</label>
          <textarea
            id="prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Benefits of learning React for beginners"
          />
          <div className="row">
            <div>
              <label htmlFor="type">Format</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tone">Tone</label>
              <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)}>
                {TONES.map((t) => (
                  <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? "Writing..." : "Generate"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>

        {(output || loading) && (
          <section className="panel result">
            <div className="result-head">
              <h2>Result</h2>
              {output && !loading && (
                <button className="ghost" onClick={copy}>{copied ? "Copied" : "Copy text"}</button>
              )}
            </div>
            <div className="output">{output || "Starting..."}</div>
          </section>
        )}

        <section className="panel">
          <h2>History</h2>
          {history.length === 0 ? (
            <p className="muted">Nothing here yet. Your generated content will be saved here.</p>
          ) : (
            <ul className="history">
              {history.map((item) => (
                <li key={item._id}>
                  <button className="link" onClick={() => open(item)}>
                    <strong>{item.prompt}</strong>
                    <span>{item.type} · {item.tone} · {new Date(item.createdAt).toLocaleDateString()}</span>
                  </button>
                  <button className="ghost" onClick={() => remove(item._id)} aria-label="Delete">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
