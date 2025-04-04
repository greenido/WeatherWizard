export default function Footer() {
  return (
    <footer className="py-4 px-6 border-t dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
      <div className="container mx-auto">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <a 
            href="http://greenido.wordpress.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Ido's Blog
          </a>
          <span className="mx-2">•</span>
          <a 
            href="https://x.com/greenido" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Comments?
          </a>
        </p>
      </div>
    </footer>
  );
}