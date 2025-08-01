// Hàm chuẩn hóa dữ liệu về array
const parseOptions = (options) => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'object') return Object.values(options);
    if (typeof options === 'string') {
        try {
            const parsed = JSON.parse(options);
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'object') return Object.values(parsed);
        } catch (e) {
            return [options];
        }
    }
    return [];
};

export default parseOptions; 