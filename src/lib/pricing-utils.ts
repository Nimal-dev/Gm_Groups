export function calculateBulkOrderSurcharge(baseAmount: number, eventDate: string | Date | undefined, collectionDateOverride?: string | Date) {
    if (!baseAmount || !eventDate) return { base: 0, surcharge: 0, total: 0, msg: "Pending Info", type: "None", daysNotice: 0 };

    let event: Date;
    if (typeof eventDate === 'string') {
        event = new Date(eventDate);
    } else {
        event = eventDate;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let collection: Date;
    if (collectionDateOverride) {
        collection = new Date(collectionDateOverride);
    } else {
        // Collection date is 1 day before event by default
        collection = new Date(event);
        collection.setDate(event.getDate() - 1);
    }

    const diffTime = collection.getTime() - today.getTime();
    const daysNotice = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let surcharge = 0;
    let msg = "Standard";
    let type = "Standard (5+ Days)";

    if (daysNotice < 1) { // < 24 Hours
        surcharge = baseAmount * 2; // +200% = 3x total
        msg = "SuperFine (3x)";
        type = "SuperFine (< 24 Hours)";
    } else if (daysNotice <= 2) { // 24-48 Hours
        surcharge = baseAmount * 0.30;
        msg = "SuperFast (+30%)";
        type = "SuperFast (24-48 Hours)";
    } else if (daysNotice <= 4) { // 3-4 Days
        surcharge = baseAmount * 0.15;
        msg = "Late (+15%)";
        type = "Late (3-4 Days)";
    }

    return {
        base: baseAmount,
        surcharge: Math.round(surcharge),
        total: Math.round(baseAmount + surcharge),
        msg,
        type,
        daysNotice
    };
}
