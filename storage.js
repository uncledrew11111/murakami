// Phone Number Storage Module
const PhoneStorage = {
    STORAGE_KEY: 'julian_phone_number',
    ALL_NUMBERS_KEY: 'julian_all_numbers',

    save(phoneNumber) {
        const data = {
            phoneNumber: phoneNumber,
            timestamp: new Date().toISOString(),
            gameCompleted: true
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

        // Also save to a list of all numbers
        let allNumbers = this.getAllNumbers();
        allNumbers.push(data);
        localStorage.setItem(this.ALL_NUMBERS_KEY, JSON.stringify(allNumbers));

        return data;
    },

    get() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    getAllNumbers() {
        const data = localStorage.getItem(this.ALL_NUMBERS_KEY);
        return data ? JSON.parse(data) : [];
    },

    downloadAsJSON() {
        const allNumbers = this.getAllNumbers();
        if (allNumbers.length === 0) {
            const single = this.get();
            if (!single) return false;
            allNumbers.push(single);
        }

        const blob = new Blob([JSON.stringify(allNumbers, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `julian_phone_numbers_${Date.now()}.json`;
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
    },

    // View all numbers in console (for you to check)
    viewInConsole() {
        const numbers = this.getAllNumbers();
        console.log('=== JULIAN\'S PHONE NUMBERS ===');
        numbers.forEach((entry, i) => {
            console.log(`${i + 1}. ${entry.phoneNumber} (${entry.timestamp})`);
        });
        return numbers;
    }
};

// Make it easy to access from browser console
window.PhoneStorage = PhoneStorage;

