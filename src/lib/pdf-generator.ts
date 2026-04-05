import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FullReportData } from '@/actions/report';

/**
 * Generates a professional PDF report for the shop.
 */
export async function generateShopPDF(data: FullReportData, reportTo: string, reportFrom: string) {
    // @ts-ignore - jspdf-autotable extends jsPDF but types can be tricky
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB');

    // --- Header ---
    doc.setFillColor(31, 41, 55); // Dark Slate
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('KOI CAFE', 14, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OVERALL SHOP PERFORMANCE REPORT', 14, 33);
    
    doc.text(`Date Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 20, { align: 'right' });
    doc.text(`Period: ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`, pageWidth - 14, 27, { align: 'right' });

    // --- Metadata ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT DETAILS', 14, 55);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Prepared By: ${reportFrom || 'Management'}`, 14, 62);
    doc.text(`Recipient: ${reportTo || 'General Administration'}`, 14, 68);

    // --- 1. Financial Summary ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('1. FINANCIAL SUMMARY', 14, 85);
    
    const financialData = [
        ['Metric', 'Amount'],
        ['Opening Balance', fmt(data.financials.openingBalance)],
        ['Total Income (Deposits)', fmt(data.financials.totalIncome)],
        ['Total Operational Expense', fmt(data.financials.totalExpense)],
        ['Total Salaries Paid', fmt(data.financials.totalSalaries)],
        ['Closing Balance', fmt(data.financials.closingBalance)],
        ['NET PROFIT / LOSS', fmt(data.financials.netProfit)]
    ];

    (doc as any).autoTable({
        startY: 90,
        head: [financialData[0]],
        body: financialData.slice(1),
        theme: 'striped',
        headStyles: { fillStyle: [43, 63, 229] }, // Accent color
        columnStyles: {
            1: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: function(data: any) {
            if (data.row.index === 5) { // Net Profit row
                data.cell.styles.fillColor = data.cell.raw.includes('-') ? [254, 226, 226] : [220, 252, 231];
                data.cell.styles.textColor = data.cell.raw.includes('-') ? [153, 27, 27] : [22, 101, 52];
            }
        }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 2. Inventory Status ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('2. INVENTORY SNAPSHOT', 14, currentY);
    
    const inventoryBody = data.inventory.length > 0 
        ? data.inventory.map(item => [item.itemName, item.quantity.toString()])
        : [['No inventory data available', '']];

    (doc as any).autoTable({
        startY: currentY + 5,
        head: [['Item Name', 'Current Quantity']],
        body: inventoryBody,
        theme: 'grid',
        headStyles: { fillColor: [75, 85, 99] },
        columnStyles: {
            1: { halign: 'center' }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 3. HR & Operations ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('3. HR & OPERATIONS', 14, currentY);

    (doc as any).autoTable({
        startY: currentY + 5,
        body: [
            ['New Members Hired', data.hr.membersAdded.toString()],
            ['Total Active Employees', data.hr.totalEmployees.toString()]
        ],
        theme: 'plain',
        columnStyles: {
            1: { halign: 'right', fontStyle: 'bold' }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 25;

    // --- Footer / Signatures ---
    if (currentY > 250) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('I hereby certify that this report is a true reflection of the shop\'s status for the specified period.', 14, currentY);
    
    doc.line(14, currentY + 20, 80, currentY + 20);
    doc.text('Signature of Preparer', 14, currentY + 25);
    
    doc.line(pageWidth - 80, currentY + 20, pageWidth - 14, currentY + 20);
    doc.text('Management Approval', pageWidth - 14, currentY + 25, { align: 'right' });

    // Save PDF
    doc.save(`Shop_Report_${formatDate(data.startDate)}_to_${formatDate(data.endDate)}.pdf`);
}
