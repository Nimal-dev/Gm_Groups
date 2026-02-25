export function formatInvoice(items: { description: string; quantity: number; price: number }[], discountStr: string, to: string, from: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };
    const generatedDate = new Date().toLocaleDateString('en-GB');
    const invoiceId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    let subtotal = 0;
    const itemRows = items.map(item => {
        const total = item.quantity * item.price;
        subtotal += total;
        return ` ${(item.description.substring(0, 44)).padEnd(45)} ${(item.quantity.toString()).padStart(5)} ${(fmt(item.price)).padStart(12)} ${(fmt(total)).padStart(12)}`;
    }).join('\n');

    const discountPct = parseFloat(discountStr) || 0;
    const discountAmount = (subtotal * discountPct) / 100;
    const grandTotal = subtotal - discountAmount;

    return `
${center('GM BURGERSHOT INVOICE')}

FROM:                                           TO:
GM BURGERSHOT                                   ${to.substring(0, 30)}
${(from || 'Manager').substring(0, 30).padEnd(46)}

                                                Date:       ${generatedDate}
                                                Invoice #:  ${invoiceId}

--------------------------------------------------------------------------------
 ITEM DESCRIPTION                                QTY   UNIT PRICE        TOTAL
--------------------------------------------------------------------------------
${itemRows || center('No Items', 80)}

--------------------------------------------------------------------------------
 SUBTOTAL                                                    ${fmt(subtotal).padStart(20)}
 DISCOUNT (${discountPct}%)                                             -${fmt(discountAmount).padStart(19)}
--------------------------------------------------------------------------------
 GRAND TOTAL                                                 ${fmt(grandTotal).padStart(20)}
--------------------------------------------------------------------------------
 
 PAYMENT DETAILS:
 Bank Account: 1509517987 (GM Burgershot)

SAFETY NOTICE:
The Food can be consumed upto 1% durability. Anything consumed less than 1% is
harmful and GM Burgershot is not responsible for it.

ACKNOWLEDGEMENT:
I acknowledge receipt of the above items in good condition and agree to the
terms stated herein.

Signature: ${from || '______________________'}
`.replace(/^\n/, '');
}

export function formatReport(type: string, data: any, to: string, from: string, membersRemoved: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const padStart = (str: string, length: number) => str.padStart(length);
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };

    const generatedDate = new Date().toLocaleDateString('en-GB');
    const periodStart = new Date(data.startDate).toLocaleDateString('en-GB');
    const periodEnd = new Date(data.endDate).toLocaleDateString('en-GB');

    return `
${center('GM BURGERSHOT')}
${center(`${type.toUpperCase()} PERFORMANCE REVIEW`)}

REPORT METADATA
================================================================================
Date Generated: ${generatedDate}
Report Period:  ${periodStart} - ${periodEnd}
Prepared By:    ${from || '[Name]'}
Recipient:      ${to || 'High Command'}
================================================================================

FINANCIAL OVERVIEW
--------------------------------------------------------------------------------
 Metric                   | Amount
--------------------------|-----------------------------------------------------
 Total Revenue            | ${padStart(fmt(data.totalIncome), 20)}
 Total Operational Costs  | ${padStart(fmt(data.totalExpense), 20)}
--------------------------|-----------------------------------------------------
 NET OPERATIONAL PROFIT   | ${padStart(fmt(data.netProfit), 20)}
--------------------------------------------------------------------------------

HUMAN RESOURCES SUMMARY
--------------------------------------------------------------------------------
 Metric                   | Count
--------------------------|-----------------------------------------------------
 New Members              | ${padStart(data.membersAdded.toString(), 20)}
 Members Removed          | ${padStart(membersRemoved || '0', 20)}
--------------------------------------------------------------------------------

CERTIFICATION
--------------------------------------------------------------------------------
I hereby certify that the information provided in this report is accurate and
reflects the financial and operational status of GM Burgershot.

Signature: NIMAL PRINCE
Title:     Restaurant Manager
Date:      ${generatedDate}
`.replace(/^\n/, '');
}

export function formatCitizenContract(data: { items: any[], eventDate: string }, clientName: string, providerName: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };
    const tableRow = (label: string, value: string) => {
        return `| ${label.padEnd(46)} | ${value.padStart(27)} |`;
    };
    const separator = `+${'-'.repeat(48)}+${'-'.repeat(29)}+`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = today.toLocaleDateString('en-GB');

    const eventDateObj = new Date(data.eventDate);
    const eventDateStr = eventDateObj.toLocaleDateString('en-GB');

    const colDateObj = new Date(eventDateObj);
    const collectionDateStr = colDateObj.toLocaleDateString('en-GB');

    const diffTime = colDateObj.getTime() - today.getTime();
    const daysNotice = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let feeName = "Standard";
    let feeType = "None";
    let feeAmount = 0;
    let subtotal = 0;
    let totalQty = 0;

    const itemRows = data.items.map((item: any, i: number) => {
        const total = item.quantity * item.price;
        subtotal += total;
        totalQty += item.quantity;
        const idx = `${i + 1}.`;
        const name = item.description.substring(0, 30).padEnd(30);
        const qty = item.quantity.toString().padEnd(15);
        const price = fmt(item.price).padEnd(20);
        const lineTotal = fmt(total);
        return `${idx.padEnd(3)} ${name} ${qty} ${price} ${lineTotal}`;
    }).join('\n');

    if (daysNotice <= 1) {
        feeName = "SuperFine Fee (3x)";
        feeType = "SuperFine (< 24 Hours)";
        feeAmount = subtotal * 2;
    } else if (daysNotice <= 2) {
        feeName = "Superfast Fee (30%)";
        feeType = "Superfast (24-48 Hours)";
        feeAmount = Math.round(subtotal * 0.30);
    } else if (daysNotice <= 4) {
        feeName = "Late Fee (15%)";
        feeType = "Late (3-4 Days)";
        feeAmount = Math.round(subtotal * 0.15);
    } else {
        feeName = "Standard (No Fee)";
        feeType = "Standard (5+ Days)";
        feeAmount = 0;
    }

    const grandTotal = subtotal + feeAmount;
    const advance = Math.round(grandTotal * 0.50);
    const balance = grandTotal - advance;

    return `
${center('GM BURGERSHOT')}
${center('CITIZEN BULK ORDER AGREEMENT')}

Date of Booking: ${bookingDate}

1. Parties Involved
    - SERVICE PROVIDER
      Name: GM Burgershot
      Representative: ${(providerName || 'Nimal Prince').toUpperCase()}
      
    - CLIENT
      Representative: ${(clientName || 'OLANGA KUTTAN').toUpperCase()}

2. EVENT & COLLECTION SCHEDULE
* Target Event Date: ${eventDateStr}
* Mandatory Collection Date: ${collectionDateStr}
* Days Notice: ${daysNotice} Days (${feeType})
* Collection Time: 10:30pm


3. ORDER SPECIFICATIONS
     Item Name                          Quantity              Unit Price           Total
----------------------------------------------------------------------------------------
${itemRows}
----------------------------------------------------------------------------------------
Total Quantity: ${totalQty}

4. FINANCIAL SUMMARY
${separator}
${tableRow("Item Subtotal", fmt(subtotal))}
${tableRow(feeName, fmt(feeAmount))}
${separator}
${tableRow("GRAND TOTAL", fmt(grandTotal))}
${separator}
${tableRow("50% ADVANCE (Non-Refundable)", fmt(advance))}
${tableRow("REMAINING BALANCE (Due on Collection)", fmt(balance))}
${separator}


5. TERMS & CONDITIONS
- All bulk orders require a minimum of 5 days notice for Standard rates.
- Current Order Classification: **${feeType}**. 
- This contract covers one single bulk order. Split deliveries are prohibited.
- The 50% Advance Payment is strictly non-refundable.

*Collection & Liability:
- The Client acknowledges that food is being collected 24 hours prior to consumption.
- Upon handover on the Collection Date, GM Burgershot transfers all liability regarding food safety to the Client.
- GM Burgershot is not responsible for spoilage due to improper storage.
- If uncollected, food is discarded, and Client remains liable for the Full Grand Total.

6. ACCEPTANCE
By signing below, both parties agree to the terms listed above.

For GM Burgershot: Signature: GM | ${(providerName || 'Nimal Prince').toUpperCase()} Date: ${collectionDateStr}

For Client: Signature: ${(clientName || '__________________').toUpperCase()} Date: ${collectionDateStr} 
`.replace(/^\n/, '');
}

export function formatEventContract(data: { items: any[], eventDate: string, collectionTime: string }, clientName: string, providerName: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };
    const tableRow = (label: string, value: string) => `| ${label.padEnd(46)} | ${value.padStart(27)} |`;
    const separator = `+${'-'.repeat(48)}+${'-'.repeat(29)}+`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = today.toLocaleDateString('en-GB');

    const eventDateObj = new Date(data.eventDate);
    const eventDateStr = eventDateObj.toLocaleDateString('en-GB');

    const colDateObj = new Date(eventDateObj);
    const collectionDateStr = colDateObj.toLocaleDateString('en-GB');

    const diffTime = colDateObj.getTime() - today.getTime();
    const daysNotice = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let feeName = "Standard (5+ Days)";
    let feeType = "None";
    let feeAmount = 0;
    let subtotal = 0;
    let totalQty = 0;

    const itemRows = data.items.map((item: any, i: number) => {
        const total = item.quantity * item.price;
        subtotal += total;
        totalQty += item.quantity;
        return `${(i + 1).toString().padEnd(3)} ${(item.description.substring(0, 30)).padEnd(30)} ${(item.quantity.toString()).padEnd(15)} ${fmt(item.price).padEnd(12)} ${fmt(total)}`;
    }).join('\n');

    if (daysNotice <= 1) { // < 24 Hours
        feeName = "Tier 3: Superfine (< 24h)";
        feeType = "Tier 3 (3x)";
        feeAmount = subtotal * 2;
    } else if (daysNotice <= 2) { // 24-48 Hours
        feeName = "Tier 2: Rush Fee (24-48h)";
        feeType = "Tier 2 (30%)";
        feeAmount = Math.round(subtotal * 0.30);
    } else if (daysNotice <= 4) { // 3-4 Days
        feeName = "Tier 1: Surcharge (3-4 Days)";
        feeType = "Tier 1 (15%)";
        feeAmount = Math.round(subtotal * 0.15);
    } else {
        feeName = "Standard";
        feeType = "Standard";
        feeAmount = 0;
    }

    const grandTotal = subtotal + feeAmount;
    const advance = Math.round(grandTotal * 0.50);
    const balance = grandTotal - advance;

    const feeDisplay = feeAmount > 0 ? fmt(feeAmount) : '$ 0';
    const feeRow = feeAmount > 0 ? tableRow(feeName, feeDisplay) : tableRow("Surcharge/Fee", "$ 0");

    return `
${center('GM BURGERSHOT')}
${center('BULK ORDER & CATERING POLICY')}

Date of Booking: ${bookingDate}

1. PARTIES INVOLVED
    - SERVICE PROVIDER
      Name: GM Burgershot 
      Representative: ${(providerName || 'Nimal Prince').toUpperCase()}

    - CLIENT
      Organization: ${(clientName || 'X-Club').toUpperCase()}

2. SCHEDULING & LEAD TIMES
   Booking Lead Time: Orders must be initiated a minimum of 5 Business Days 
   prior to the Collection Date.

   * Target Event Date: ${eventDateStr}
   * Mandatory Collection Date: ${collectionDateStr} (1 Day Prior)
   * Collection Time: ${data.collectionTime || '10:30 PM'}
   * Lead Time Classification: ${daysNotice} Days (${feeType})

3. ORDER SPECIFICATIONS
     Item Name                          Quantity              Unit Price           Total
${itemRows}
Total Quantity: ${totalQty}

4. FINANCIAL SUMMARY
${separator}
${tableRow("Item Subtotal", fmt(subtotal))}
${feeRow}
${separator}
${tableRow("GRAND TOTAL", fmt(grandTotal))}
${separator}
${tableRow("50% ADVANCE (Non-Refundable)", fmt(advance))}
${tableRow("REMAINING BALANCE (Due -24h)", fmt(balance))}
${separator}

5. TERMS & CONDITIONS (ABRIDGED)
   Full policy available at GM Management.

   FINANCIAL OBLIGATIONS:
   - Advance Payment: A 50% Non-Refundable Deposit is required upon contract 
     signing to secure inventory and labor.
   - Final Settlement: The remaining 50% balance must be cleared 24 hours 
     prior to the scheduled collection time.
   - Cancellation <4 Days: Deposit Forfeited. <48 Hours: 100% Due.

   QUALITY CONTROL & LIABILITY:
   - Chain of Custody: Liability transfers to Client immediately upon handover.
   - Food Safety: GM Burgershot certifies food leaves at safe temps.
   - Client Responsibility: Maintaining below 5°C and reheating >75°C.
   - Waiver: Client indemnifies GM Burgershot against claims arising from 
     consumption >32 hours after handover or improper storage.
   - Durability: Food consumed <1% durability is strictly forbidden.

6. ACCEPTANCE
   By signing below, the Client accepts the "Bulk Order & Catering Policy" 
   and agrees to the financial terms above.

   For GM Burgershot: ___________________________ Date: ${collectionDateStr}
   (Signed by ${(providerName || 'Manager').toUpperCase()})

   For ${(clientName || 'Client').toUpperCase()}: ___________________________ Date: ${collectionDateStr}
`.replace(/^\n/, '');
}

export function formatRecurringContract(data: any, clientName: string, clientRep: string, providerName: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };
    const tableRow = (label: string, value: string) => `| ${label.padEnd(46)} | ${value.padStart(27)} |`;
    const separator = `+${'-'.repeat(48)}+${'-'.repeat(29)}+`;

    const agreementDate = new Date().toLocaleDateString('en-GB');
    const startDate = new Date(data.startDate).toLocaleDateString('en-GB');

    let subtotal = 0;
    let totalQty = 0;

    const itemRows = data.items.map((item: any, i: number) => {
        const total = item.quantity * item.price;
        subtotal += total;
        totalQty += item.quantity;
        return `${(i + 1).toString().padEnd(3)} ${(item.description.substring(0, 30)).padEnd(30)} ${(item.quantity.toString()).padEnd(8)} ${fmt(item.price).padEnd(12)} ${fmt(total)}`;
    }).join('\n');

    const recurringCost = subtotal;
    const totalPayablePerCycle = recurringCost + data.deliveryFee;

    // Auto-calculate security deposit if 0 (2x cycle)
    const securityDeposit = data.securityDeposit > 0 ? data.securityDeposit : (totalPayablePerCycle * 2);

    return `
${center('GM BURGERSHOT')}
${center('RECURRING BULK ORDER AGREEMENT')}

Agreement Date: ${agreementDate}

1. PARTIES INVOLVED
SERVICE PROVIDER (SUPPLIER): 
Name: GM Burgershot
Representative: ${(providerName || 'Manager').toUpperCase()}
Contact: MADHAVAN UNNI (91732487)

CLIENT (RETAILER/PARTNER)
Name: ${(clientName || 'Client Org').toUpperCase()}
Representative: ${(clientRep || 'Client Rep').toUpperCase()} (LEADER)

2. CONTRACT DURATION & SCHEDULE
This agreement represents a standing order for an indefinite period, subject to the termination clauses below.

Contract Start Date: ${startDate}
Supply Frequency: [${data.frequency === 'Weekly' ? 'X' : ' '}] Weekly  [${data.frequency === 'Bi-Weekly' ? 'X' : ' '}] Bi-Weekly  [${data.frequency === 'Daily' ? 'X' : ' '}] Daily
Designated Collection/Handover Day: ${(data.collectionDay || 'MONDAY').toUpperCase()}

Designated Time: ${(data.collectionTime || '10:30PM').toUpperCase()}

3. STANDING ORDER SPECIFICATIONS
The following items will be prepared and made available for every cycle defined above.

Item Name                         Quantity    Unit Price     Total Per Cycle
---------------------------------------------------------------------------
${itemRows}
---------------------------------------------------------------------------
TOTALS   Total Qty: ${totalQty.toString().padEnd(10)}            ${fmt(subtotal)}
(Client may adjust quantities for a specific week by providing 48 hours written notice.)

4. FINANCIAL SUMMARY & PAYMENT TERMS
A. PRICING
${separator}
${tableRow("Recurring Cost Per Cycle", fmt(recurringCost))}
${tableRow("Delivery/Handling Fee", fmt(data.deliveryFee))}
${separator}
${tableRow("TOTAL PAYABLE PER CYCLE", fmt(totalPayablePerCycle))}
${separator}

B. SECURITY DEPOSIT:
To secure this contract and cover stock allocation, the Client agrees to a Refundable Security Deposit equivalent to two (2) cycles of orders.

Security Deposit Amount: ${fmt(securityDeposit)} (Due upon signing)

This deposit is refundable upon contract termination, provided all outstanding invoices are cleared.

C. BILLING & PAYMENT SCHEDULE: Select the agreed payment method for the recurring orders:

[${data.paymentMethod === 'Pay-on-Collection' ? 'X' : ' '}] Pay-on-Collection: Payment must be cleared in full at the time of pickup/handover each week.

[${data.paymentMethod === 'Weekly Invoice' ? 'X' : ' '}] Weekly Invoice: Invoice generated on Monday; Due by Friday of the same week.

D. LATE FEES

A late fee of ${fmt(data.lateFee)} applies to any payment overdue by more than 3 days.

5. TERMS & CONDITIONS
1. Order Modifications: Permanent changes to the Standing Order must be requested 7 days in advance. Temporary changes for a specific week require 48 hours notice.

2. Contract Termination: Either party may terminate this agreement with 14 days written notice.
If the Client terminates without notice, the Security Deposit will be forfeited.

3. Collection & Liability (Strict):
Handover: Upon handover on the Designated Collection Day, GM Burgershot transfers all liability regarding food safety, temperature control, and storage to the Client.

Storage: The Client is solely responsible for maintaining appropriate refrigeration/heating standards once the items leave GM Burgershot premises. GM Burgershot is not liable for spoilage due to Client negligence.

Uncollected Goods: If the order is not collected on the agreed day, the food will be discarded for safety reasons, but the Client remains liable for the full cost of that cycle, as the stock was prepared specifically for them.

4. Price Fluctuations: GM Burgershot reserves the right to adjust Unit Prices based on raw material market rates. A 15-day notice will be provided to the Client before any price increase takes effect.

6. ACCEPTANCE
By signing below, the Client agrees to the recurring supply terms, the security deposit requirement, and the liability transfer.

For GM Burgershot
Date: ${agreementDate}
Signature: 
${(providerName || 'MADHAVAN UNNI').toUpperCase()}

For Client
Date: ${agreementDate}
Signature: ${clientRep} 
`.replace(/^\n/, '');
}
