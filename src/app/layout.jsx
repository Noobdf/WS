import './globals.css';

export const metadata = {
  title: 'CineLista: seu catálogo de filmes',
  description: 'Organize seus filmes, registre o que já assistiu e planeje a próxima sessão.',
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
