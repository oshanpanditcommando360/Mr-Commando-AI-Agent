import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: TableProps) {
  return (
    <thead className={`bg-[#0f172a] ${className}`}>{children}</thead>
  );
}

export function TableBody({ children, className = "" }: TableProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className = "" }: TableProps) {
  return (
    <tr
      className={`border-b border-[#334155] hover:bg-[#334155]/50 transition-colors ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }: TableProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }: TableProps) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-300 ${className}`}>
      {children}
    </td>
  );
}
