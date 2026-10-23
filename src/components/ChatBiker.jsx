import { useEffect, useRef, useState } from 'react';
import { obtenerUrlChat } from '../utils/chatApi';

export default function ChatBiker({ entorno = import.meta.env }) {
  const urlChat = obtenerUrlChat(entorno);
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const entrada = useRef(null);
  const boton = useRef(null);
  const historial = useRef(null);
  const pendiente = useRef(false);

  useEffect(() => { if (abierto) entrada.current?.focus(); }, [abierto]);
  useEffect(() => {
    if (historial.current) historial.current.scrollTop = historial.current.scrollHeight;
  }, [mensajes, enviando, abierto]);

  function cerrar() { setAbierto(false); boton.current?.focus(); }

  async function enviar(evento) {
    evento.preventDefault();
    if (!urlChat || !texto.trim() || pendiente.current) return;
    const pregunta = texto.trim();
    const conversacion = [...mensajes.slice(-14), { role: 'user', text: pregunta }];
    pendiente.current = true;
    setEnviando(true);
    setError('');
    try {
      const respuesta = await fetch(urlChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: conversacion }),
        signal: AbortSignal.timeout(75000),
      });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok || !datos.respuesta) throw new Error(datos.error || 'El asistente no está disponible. Puedes escribirnos por WhatsApp.');
      setMensajes([...conversacion, { role: 'model', text: datos.respuesta }]);
      setTexto('');
    } catch (e) {
      setError(e.name === 'TimeoutError' ? 'La respuesta tardó demasiado. Inténtalo nuevamente.' : e.message || 'No pudimos conectar. Inténtalo nuevamente.');
    } finally { pendiente.current = false; setEnviando(false); }
  }

  return <>
    <button ref={boton} className="ia-flotante" type="button" aria-expanded={abierto} aria-controls="chat-biker" onClick={() => setAbierto(!abierto)}>
      <span aria-hidden="true">✦</span> Biker IA
    </button>
    {abierto && <section id="chat-biker" className="chat-biker" aria-labelledby="chat-titulo" onKeyDown={e => { if (e.key === 'Escape') cerrar(); }}>
      <header className="chat-cabecera">
        <div><h2 id="chat-titulo">Biker IA</h2><small>Tu asistente de motocicletas · Gemini</small></div>
        <button type="button" className="chat-cerrar" aria-label="Cerrar chat" onClick={cerrar}>×</button>
      </header>
      <div ref={historial} className="chat-historial" role="log" aria-live="polite" aria-label="Conversación con Biker IA">
        <p className="chat-mensaje">¡Hola! Soy el asistente de IA de Zona Bikers. Puedo orientarte sobre mecánica, ropa y accesorios para motos. ¿En qué te ayudo?</p>
        {mensajes.map((m, i) => <p key={i} className={`chat-mensaje ${m.role === 'user' ? 'chat-usuario' : ''}`}><strong>{m.role === 'user' ? 'Tú' : 'Biker IA'}</strong>{m.text}</p>)}
        {enviando && <p role="status">Consultando a Biker IA…</p>}
      </div>
      <form onSubmit={enviar} className="chat-formulario">
        {!urlChat && <p role="alert" className="chat-error">El chat no está disponible: todavía no se ha configurado el servidor. Puedes contactarnos por WhatsApp.</p>}
        <p className="chat-aviso">Orientación de IA; no reemplaza una revisión en taller. Al enviar, tu consulta e historial reciente se comparten con Google Gemini. Evita datos personales.</p>
        {error && <p role="alert" className="chat-error">{error}</p>}
        <label htmlFor="consulta-biker" className="visually-hidden">Tu consulta sobre motocicletas</label>
        <textarea ref={entrada} id="consulta-biker" className="form-control" rows={2} maxLength={2000} value={texto} readOnly={enviando} onChange={e => setTexto(e.target.value)} placeholder="¿Cómo elegir un casco para mi moto?" />
        <div className="chat-acciones">
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={enviando || !mensajes.length} onClick={() => { setMensajes([]); setError(''); entrada.current?.focus(); }}>Limpiar chat</button>
          <button type="submit" className="btn btn-biker btn-sm" disabled={!urlChat || enviando || !texto.trim()}>{enviando ? 'Consultando…' : 'Enviar'}</button>
        </div>
      </form>
    </section>}
  </>;
}
