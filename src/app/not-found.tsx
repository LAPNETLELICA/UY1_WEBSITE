import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 24px",
      textAlign: "center",
      background: "var(--page-background, #08111e)",
      color: "#ffffff"
    }}>
      <span style={{
        fontSize: "0.85rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--color-primary-light, #22d3ee)",
        fontWeight: 700,
        marginBottom: "16px"
      }}>
        404 · Page Not Found / Page Introuvable
      </span>
      <h1 style={{
        fontSize: "clamp(2rem, 5vw, 3.5rem)",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        marginBottom: "20px",
        lineHeight: 1.1
      }}>
        Page Not Found
      </h1>
      <p style={{
        maxWidth: "520px",
        color: "rgba(255, 255, 255, 0.72)",
        fontSize: "1.05rem",
        lineHeight: 1.6,
        marginBottom: "32px"
      }}>
        The requested university resource or document could not be located. / La ressource ou la page demandée est introuvable ou a été déplacée.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 28px",
          background: "var(--color-primary, #0284c7)",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "0.95rem",
          letterSpacing: "0.02em",
          textDecoration: "none",
          borderRadius: 0,
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}
      >
        <span>← Return to Home / Retour à l'accueil</span>
      </Link>
    </div>
  );
}

