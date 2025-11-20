export const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-8 pb-32">
      <div className="flex flex-col items-center gap-2 mb-3">
        <span className="text-6xl font-extrabold text-primary">404</span>
        <h2 className="text-2xl font-semibold text-foreground">Página no encontrada</h2>
      </div>
      <p className="text-base text-muted-foreground max-w-md">
        Lo sentimos, la página que buscas no existe o ha sido movida.<br />
        Por favor, verifica la URL o navega a otra sección.
      </p>
    </div>
  );
};