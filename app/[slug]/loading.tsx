export default function ProfileLoading() {
  return (
    <main className="profile-page" aria-busy="true" aria-label="A carregar perfil">
      <div className="profile-shell">
        <div className="profile-loading-hero" />
        <p className="profile-loading-copy">A carregar perfil…</p>
      </div>
    </main>
  );
}
