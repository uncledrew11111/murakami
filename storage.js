// Phone Number Storage Module
const PhoneStorage = {
    STORAGE_KEY: 'julian_phone_number',

    save(phoneNumber) {
        const data = {
            phoneNumber: phoneNumber,
            timestamp: new Date().toISOString(),
            gameCompleted: true
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        return data;
    },

    get() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    downloadAsJSON() {
        const data = this.get();
        if (!data) return false;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `julian_phone_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    },

    formatPhoneNumber(value) {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        if (match) {
            let formatted = '';
            if (match[1]) formatted = '(' + match[1];
            if (match[1].length === 3) formatted += ') ';
            if (match[2]) formatted += match[2];
            if (match[2].length === 3) formatted += '-';
            if (match[3]) formatted += match[3];
            return formatted;
        }
        return value;
    }
};
