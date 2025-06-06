export default function Footer() {
  return (
    <footer className="bg-gray-200 p-4 shadow-inner">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} GoodFood. All rights reserved.</p>
      </div>
    </footer>
  );
}
