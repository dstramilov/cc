import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
    onExportExcel?: () => void;
    onExportCSV?: () => void;
    label?: string;
}

export function ExportButton({ onExportExcel, onExportCSV, label = "Export" }: ExportButtonProps) {
    if (!onExportExcel && !onExportCSV) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        {label}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onExportExcel && (
                    <DropdownMenuItem onClick={onExportExcel}>
                        Export to Excel
                    </DropdownMenuItem>
                )}
                {onExportCSV && (
                    <DropdownMenuItem onClick={onExportCSV}>
                        Export to CSV
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
