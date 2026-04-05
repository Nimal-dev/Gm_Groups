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
    
    const financialSummary = [
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
        head: [financialSummary[0]],
        body: financialSummary.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [43, 63, 229] },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        didParseCell: function(cellData: any) {
            if (cellData.row.index === 5) {
                const val = cellData.cell.raw;
                cellData.cell.styles.fillColor = val.includes('-') ? [254, 226, 226] : [220, 252, 231];
                cellData.cell.styles.textColor = val.includes('-') ? [153, 27, 27] : [22, 101, 52];
            }
        }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 2. Detailed Bank Ledger ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('2. DETAILED BANK LEDGER', 14, currentY);
    
    const bankBody = data.allTransactions.length > 0
        ? data.allTransactions.map(t => [formatDate(t.date), t.transactionType, t.amount.toLocaleString(), (t.memo || t.transferredTo || '').substring(0, 40)])
        : [['No transactions found', '', '', '']];

    (doc as any).autoTable({
        startY: currentY + 5,
        head: [['Date', 'Type', 'Amount', 'Memo/Details']],
        body: bankBody,
        theme: 'grid',
        headStyles: { fillColor: [31, 41, 55] },
        styles: { fontSize: 8 },
        columnStyles: { 2: { halign: 'right' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 3. Salary Payouts ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.text('3. SALARY PAYOUTS', 14, currentY);

    const salaryBody = data.allSalaries.length > 0
        ? data.allSalaries.map(s => [formatDate(s.date), s.username || s.userId, fmt(s.amount), s.processorName || 'System'])
        : [['No salaries recorded', '', '', '']];

    (doc as any).autoTable({
        startY: currentY + 5,
        head: [['Date', 'Recipient', 'Amount', 'Processed By']],
        body: salaryBody,
        theme: 'striped',
        headStyles: { fillColor: [107, 114, 128] },
        styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 4. Staff Activity (Duty Logs) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.text('4. STAFF ACTIVITY (DUTY LOGS)', 14, currentY);

    const dutyBody = data.dutyLogs.length > 0
        ? data.dutyLogs.map(d => [d.username, formatDate(new Date(d.startTime).toISOString()), (d.durationMs / 1000 / 60 / 60).toFixed(2) + ' hrs'])
        : [['No activity recorded', '', '']];

    (doc as any).autoTable({
        startY: currentY + 5,
        head: [['Staff Name', 'Date', 'Duration']],
        body: dutyBody,
        theme: 'grid',
        headStyles: { fillColor: [55, 65, 81] },
        styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 5. Inventory Snapshot ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.text('5. INVENTORY SNAPSHOT', 14, currentY);
    
    const inventoryBody = data.inventory.length > 0 
        ? data.inventory.map(item => [item.itemName, item.quantity.toString()])
        : [['No inventory data available', '']];

    (doc as any).autoTable({
        startY: currentY + 5,
        head: [['Item Name', 'Current Quantity']],
        body: inventoryBody,
        theme: 'grid',
        headStyles: { fillColor: [75, 85, 99] },
        columnStyles: { 1: { halign: 'center' } }
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
