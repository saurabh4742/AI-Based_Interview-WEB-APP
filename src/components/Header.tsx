import { Bot } from 'lucide-react'; // Using an icon

export default function Header() {
  return (
    <header className="border-b border-border/40">
      <div className="container mx-auto flex items-center justify-center p-4">
        <Bot className="h-6 w-6 mr-2" />
        <h1 className="text-xl font-bold">
          AI Interview Assistant
        </h1>
      </div>
    </header>
  );
}