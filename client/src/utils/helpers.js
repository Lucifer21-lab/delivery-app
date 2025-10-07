export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const getInitials = (name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
};

export const generateAvatar = (name) => {
    const initials = getInitials(name);
    const colors = [
        'bg-red-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500'
    ];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    return {
        initials,
        color: colors[colorIndex]
    };
};

export const sortByDate = (array, key = 'createdAt', order = 'desc') => {
    return [...array].sort((a, b) => {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
};

export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

export const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const isValidURL = (string) => {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
};

export const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
};

export const getStatusColor = (status) => {
    const colors = {
        pending: 'yellow',
        accepted: 'blue',
        in_progress: 'purple',
        completed: 'green',
        cancelled: 'red',
        expired: 'gray'
    };
    return colors[status] || 'gray';
};

export const filterByStatus = (items, status) => {
    if (!status || status === 'all') return items;
    return items.filter(item => item.status === status);
};

export const paginate = (array, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return {
        data: array.slice(startIndex, endIndex),
        totalPages: Math.ceil(array.length / limit),
        currentPage: page,
        totalItems: array.length
    };
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const validateForm = (values, rules) => {
    const errors = {};

    Object.keys(rules).forEach(field => {
        const rule = rules[field];
        const value = values[field];

        if (rule.required && !value) {
            errors[field] = `${field} is required`;
        }

        if (rule.minLength && value && value.length < rule.minLength) {
            errors[field] = `${field} must be at least ${rule.minLength} characters`;
        }

        if (rule.maxLength && value && value.length > rule.maxLength) {
            errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
        }

        if (rule.pattern && value && !rule.pattern.test(value)) {
            errors[field] = rule.message || `${field} format is invalid`;
        }

        if (rule.custom && value) {
            const customError = rule.custom(value);
            if (customError) errors[field] = customError;
        }
    });

    return errors;
};

export const objectToFormData = (obj, formData = new FormData(), parentKey = '') => {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const formKey = parentKey ? `${parentKey}[${key}]` : key;

        if (value === null || value === undefined) {
            return;
        }

        if (value instanceof File || value instanceof Blob) {
            formData.append(formKey, value);
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (typeof item === 'object' && !(item instanceof File)) {
                    objectToFormData(item, formData, `${formKey}[${index}]`);
                } else {
                    formData.append(`${formKey}[]`, item);
                }
            });
        } else if (typeof value === 'object') {
            objectToFormData(value, formData, formKey);
        } else {
            formData.append(formKey, value);
        }
    });

    return formData;
};

export const isObjectEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

export const removeEmpty = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );
};

export const arrayToObject = (array, keyField) => {
    return array.reduce((obj, item) => {
        obj[item[keyField]] = item;
        return obj;
    }, {});
};

export const uniqueArray = (array, key) => {
    if (key) {
        return [...new Map(array.map(item => [item[key], item])).values()];
    }
    return [...new Set(array)];
};

export const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, key) => {
        const pre = prefix.length ? `${prefix}.` : '';
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenObject(obj[key], pre + key));
        } else {
            acc[pre + key] = obj[key];
        }
        return acc;
    }, {});
};

export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
};

export const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
        browserName = 'Mozilla Firefox';
    } else if (ua.indexOf('SamsungBrowser') > -1) {
        browserName = 'Samsung Internet';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
        browserName = 'Opera';
    } else if (ua.indexOf('Trident') > -1) {
        browserName = 'Microsoft Internet Explorer';
    } else if (ua.indexOf('Edge') > -1) {
        browserName = 'Microsoft Edge';
    } else if (ua.indexOf('Chrome') > -1) {
        browserName = 'Google Chrome';
    } else if (ua.indexOf('Safari') > -1) {
        browserName = 'Apple Safari';
    }

    return browserName;
};

export const scrollToTop = (smooth = true) => {
    window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
    });
};

export const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
        const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
};

export const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};