import { useState } from "react";

const ELEMENTS = [
  { id: "fire",  label: "Ignis",  color: "#ff5722", glow: "rgba(255,87,34,0.6)",  symbol: "🔥", pct: 68 },
  { id: "water", label: "Oceana", color: "#00bcd4", glow: "rgba(0,188,212,0.6)",  symbol: "💧", pct: 42 },
  { id: "earth", label: "Gea",    color: "#8bc34a", glow: "rgba(139,195,74,0.6)", symbol: "⛰", pct: 85 },
  { id: "wind",  label: "Aero",   color: "#b0bec5", glow: "rgba(176,190,197,0.6)",symbol: "🌀", pct: 30 },
] as const;

const SPELLS = [
  { id: "fire",  label: "Proyectil",  color: "#ff5722", key: "Q", icon: "▲" },
  { id: "earth", label: "Estacas",    color: "#8bc34a", key: "W", icon: "◆" },
  { id: "water", label: "Escudo",     color: "#00bcd4", key: "E", icon: "◉" },
  { id: "wind",  label: "AOE",        color: "#b0bec5", key: "R", icon: "✦" },
] as const;

const ABILITIES = [
  { label: "Dash",      key: "Shift", icon: "⇒", unlocked: true },
  { label: "Stomp",     key: "↓+Z",   icon: "↡", unlocked: true },
  { label: "Doble Salto", key: "↑↑",  icon: "⬆", unlocked: true },
  { label: "Buceo",     key: "↓",     icon: "⬇", unlocked: false },
] as const;

function Bar({
  value, max, color, glow, label, compact,
}: {
  value: number; max: number; color: string; glow: string; label?: string; compact?: boolean;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-col gap-1"}>
      {label && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#6b7280", letterSpacing: "0.12em" }}>
          {label}
        </span>
      )}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "2px",
          height: compact ? "6px" : "8px",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            boxShadow: `0 0 8px ${glow}`,
            borderRadius: "2px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function MinimapCell({ type }: { type: "room" | "corridor" | "visited" | "current" | "boss" | "empty" }) {
  const styles: Record<string, string> = {
    room:     "bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.1)]",
    corridor: "bg-[rgba(255,255,255,0.06)]",
    visited:  "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.06)]",
    current:  "bg-[rgba(0,188,212,0.5)] border border-[rgba(0,188,212,0.8)]",
    boss:     "bg-[rgba(255,87,34,0.35)] border border-[rgba(255,87,34,0.6)]",
    empty:    "",
  };
  return <div className={`w-3 h-3 ${styles[type]}`} style={{ borderRadius: "1px" }} />;
}

const MAP_GRID = [
  ["empty","empty","room","corridor","room","empty","empty"],
  ["empty","corridor","corridor","empty","corridor","empty","empty"],
  ["room","corridor","visited","corridor","visited","corridor","room"],
  ["empty","empty","corridor","empty","corridor","empty","empty"],
  ["empty","empty","boss","corridor","current","empty","empty"],
  ["empty","empty","corridor","empty","empty","empty","empty"],
  ["empty","empty","room","empty","empty","empty","empty"],
] as const;

export default function App() {
  const [hp, setHp] = useState(73);
  const [essences, setEssences] = useState(ELEMENTS.map(e => e.pct));
  const [activeSpell, setActiveSpell] = useState(0);
  const [showAnnotations, setShowAnnotations] = useState(true);

  const maxHp = 100;

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: "#08080e", fontFamily: "var(--font-mono)" }}
    >
      {/* ── GAME WORLD PLACEHOLDER ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex flex-col items-center gap-3"
          style={{ color: "rgba(255,255,255,0.06)", fontFamily: "var(--font-display)", fontSize: "13px", letterSpacing: "0.2em" }}
        >
          <div
            style={{
              width: 320, height: 180,
              border: "1px dashed rgba(255,255,255,0.07)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              letterSpacing: "0.15em",
            }}
          >
            ZONA DE JUEGO
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.04)" }}>EL PÁRAMO CENICIENTO</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TOP LEFT — Health + Soul
      ══════════════════════════════════════════ */}
      <div className="absolute top-5 left-5 flex flex-col gap-2" style={{ width: 220 }}>
        {/* Portrait + HP */}
        <div className="flex items-start gap-3">
          {/* Portrait */}
          <div
            style={{
              width: 44, height: 44, flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 3,
              background: "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}
          >
            ⚗
          </div>
          {/* HP + Soul bars */}
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.1em" }}>VITALIDAD</span>
                <span style={{ fontSize: 10, color: "#e5e7eb" }}>{hp}<span style={{ color: "#4b5563" }}>/{maxHp}</span></span>
              </div>
              <Bar value={hp} max={maxHp} color="#ef4444" glow="rgba(239,68,68,0.5)" />
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.1em" }}>CONCENTRACIÓN</span>
                <span style={{ fontSize: 10, color: "#e5e7eb" }}>56<span style={{ color: "#4b5563" }}>/80</span></span>
              </div>
              <Bar value={56} max={80} color="#ce93d8" glow="rgba(206,147,216,0.5)" />
            </div>
          </div>
        </div>

        {showAnnotations && (
          <Annotation side="right">Salud · Curación gasta Concentración</Annotation>
        )}
      </div>

      {/* ══════════════════════════════════════════
          TOP RIGHT — Minimap
      ══════════════════════════════════════════ */}
      <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">
        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            padding: "10px",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 9, color: "#6b7280", letterSpacing: "0.15em" }}>MAPA</span>
            <span style={{ fontSize: 9, color: "#6b7280" }}>Esc</span>
          </div>
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(7, 12px)" }}>
            {MAP_GRID.map((row, ri) =>
              row.map((cell, ci) => <MinimapCell key={`${ri}-${ci}`} type={cell} />)
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <LegendDot color="rgba(0,188,212,0.5)" label="Actual" />
            <LegendDot color="rgba(255,87,34,0.35)" label="Jefe" />
          </div>
        </div>
        {showAnnotations && (
          <Annotation side="left">Minimapa · Interconexión de biomas</Annotation>
        )}
      </div>

      {/* ══════════════════════════════════════════
          CENTER TOP — Zone name + boss warning
      ══════════════════════════════════════════ */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
        <span style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.3em" }}>
          EL PÁRAMO CENICIENTO
        </span>
        <div
          style={{
            fontSize: 9, color: "#ff5722", letterSpacing: "0.15em",
            border: "1px solid rgba(255,87,34,0.3)",
            padding: "2px 8px", borderRadius: 2,
            background: "rgba(255,87,34,0.08)",
          }}
        >
          ⚠ JEFE PRÓXIMO
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM — Main HUD strip
      ══════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        <div className="flex items-end justify-between gap-4">

          {/* LEFT: Elemental essences */}
          <div
            style={{
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              padding: "10px 14px",
              width: 200,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 9, color: "#6b7280", letterSpacing: "0.15em" }}>ESENCIAS</span>
            </div>
            <div className="flex flex-col gap-2">
              {ELEMENTS.map((el, i) => (
                <div key={el.id} className="flex items-center gap-2">
                  <span style={{ fontSize: 12, width: 16, textAlign: "center" }}>{el.symbol}</span>
                  <span style={{ fontSize: 9, color: el.color, width: 42, letterSpacing: "0.08em" }}>{el.label}</span>
                  <div style={{ flex: 1 }}>
                    <Bar value={essences[i]} max={100} color={el.color} glow={el.glow} compact />
                  </div>
                  <span style={{ fontSize: 9, color: "#4b5563", width: 22, textAlign: "right" }}>{essences[i]}%</span>
                </div>
              ))}
            </div>
            {showAnnotations && (
              <Annotation side="right" mt>Esencias elementales · Se gastan con hechizos</Annotation>
            )}
          </div>

          {/* CENTER: Spells + Active weapon */}
          <div className="flex flex-col items-center gap-3">
            {/* Active weapon */}
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 48, height: 48,
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}
              >
                ⚔
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "#d1d5db", letterSpacing: "0.12em" }}>
                  ESPADA DE CENIZA
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                  ))}
                </div>
                <span style={{ fontSize: 9, color: "#4b5563" }}>Combo x3 · Atk básico</span>
              </div>
            </div>

            {/* Spell slots */}
            <div className="flex items-end gap-2">
              {SPELLS.map((sp, i) => (
                <button
                  key={sp.id}
                  onClick={() => setActiveSpell(i)}
                  style={{
                    width: i === activeSpell ? 52 : 42,
                    height: i === activeSpell ? 52 : 42,
                    border: `1px solid ${i === activeSpell ? sp.color : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 4,
                    background: i === activeSpell ? `rgba(${hexToRgb(sp.color)},0.15)` : "rgba(0,0,0,0.4)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: i === activeSpell ? `0 0 12px rgba(${hexToRgb(sp.color)},0.3)` : "none",
                    position: "relative",
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: i === activeSpell ? 18 : 14, color: sp.color }}>{sp.icon}</span>
                  <span style={{ fontSize: 8, color: sp.color, opacity: 0.7, letterSpacing: "0.05em" }}>{sp.label}</span>
                  <span
                    style={{
                      position: "absolute", top: 1, right: 3,
                      fontSize: 7, color: "#4b5563",
                    }}
                  >
                    {sp.key}
                  </span>
                </button>
              ))}
            </div>

            {showAnnotations && (
              <Annotation side="center">Ranuras de hechizos · Clic para equipar</Annotation>
            )}
          </div>

          {/* RIGHT: Movement abilities */}
          <div
            style={{
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              padding: "10px 14px",
              width: 200,
            }}
          >
            <span style={{ fontSize: 9, color: "#6b7280", letterSpacing: "0.15em", display: "block", marginBottom: 10 }}>
              HABILIDADES
            </span>
            <div className="flex flex-col gap-2">
              {ABILITIES.map((ab) => (
                <div key={ab.label} className="flex items-center gap-3">
                  <div
                    style={{
                      width: 28, height: 28,
                      border: `1px solid ${ab.unlocked ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: 3,
                      background: ab.unlocked ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13,
                      opacity: ab.unlocked ? 1 : 0.3,
                    }}
                  >
                    {ab.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span style={{ fontSize: 9, color: ab.unlocked ? "#d1d5db" : "#374151", letterSpacing: "0.08em" }}>
                      {ab.label}
                    </span>
                    <span style={{ fontSize: 8, color: "#4b5563" }}>{ab.unlocked ? ab.key : "— bloqueado"}</span>
                  </div>
                </div>
              ))}
            </div>
            {showAnnotations && (
              <Annotation side="left" mt>Habilidades desbloqueadas con jefes</Annotation>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CORNER — Prototype controls
      ══════════════════════════════════════════ */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4" style={{ pointerEvents: "auto" }}>
        <button
          onClick={() => setHp(h => Math.max(0, h - 10))}
          style={btnStyle("#ef4444")}
        >
          − HP
        </button>
        <button
          onClick={() => setHp(h => Math.min(maxHp, h + 10))}
          style={btnStyle("#ef4444")}
        >
          + HP
        </button>
        <button
          onClick={() => setShowAnnotations(a => !a)}
          style={btnStyle("#9ca3af")}
        >
          {showAnnotations ? "Ocultar" : "Mostrar"} notas
        </button>
        <button
          onClick={() => setEssences(e => e.map(v => Math.max(0, v - 15)))}
          style={btnStyle("#8bc34a")}
        >
          − Esencias
        </button>
      </div>

      {/* Title badge */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 9,
          letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.12)",
          padding: "3px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          background: "rgba(0,0,0,0.4)",
        }}
      >
        ELIMIA · HUD PROTOTIPO v0.1
      </div>
    </div>
  );
}

function Annotation({ children, side, mt }: { children: React.ReactNode; side: "left" | "right" | "center"; mt?: boolean }) {
  return (
    <div
      style={{
        marginTop: mt ? 8 : 0,
        fontSize: 8,
        color: "#374151",
        letterSpacing: "0.06em",
        textAlign: side === "center" ? "center" : side,
        borderTop: "1px dashed rgba(255,255,255,0.05)",
        paddingTop: 4,
      }}
    >
      {children}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div style={{ width: 8, height: 8, background: color, borderRadius: 1 }} />
      <span style={{ fontSize: 8, color: "#4b5563" }}>{label}</span>
    </div>
  );
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function btnStyle(color: string): React.CSSProperties {
  return {
    fontSize: 9,
    color,
    border: `1px solid ${color}33`,
    background: `${color}11`,
    borderRadius: 3,
    padding: "3px 10px",
    cursor: "pointer",
    letterSpacing: "0.1em",
    fontFamily: "var(--font-mono)",
    transition: "background 0.15s",
  };
}
