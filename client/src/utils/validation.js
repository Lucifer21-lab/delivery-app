export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
    return password.length >= 6 && /\d/.test(password);
};

export const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
};

export const validateDeliveryForm = (values) => {
    const errors = {};

    if (!values.title?.trim()) {
        errors.title = 'Title is required';
    } else if (values.title.length < 5) {
        errors.title = 'Title must be at least 5 characters';
    }

    if (!values.description?.trim()) {
        errors.description = 'Description is required';
    } else if (values.description.length < 10) {
        errors.description = 'Description must be at least 10 characters';
    }

    if (!values.pickupAddress?.trim()) {
        errors.pickupAddress = 'Pickup address is required';
    }

    if (!values.deliveryAddress?.trim()) {
        errors.deliveryAddress = 'Delivery address is required';
    }

    if (!values.acceptDeadline) {
        errors.acceptDeadline = 'Accept deadline is required';
    } else {
        const acceptDate = new Date(values.acceptDeadline);
        if (acceptDate <= new Date()) {
            errors.acceptDeadline = 'Accept deadline must be in the future';
        }
    }

    if (!values.deliveryDeadline) {
        errors.deliveryDeadline = 'Delivery deadline is required';
    } else if (values.acceptDeadline) {
        const acceptDate = new Date(values.acceptDeadline);
        const deliveryDate = new Date(values.deliveryDeadline);
        if (deliveryDate <= acceptDate) {
            errors.deliveryDeadline = 'Delivery deadline must be after accept deadline';
        }
    }

    if (!values.price || values.price <= 0) {
        errors.price = 'Price must be greater than 0';
    }

    return errors;
};

export const validateLoginForm = (values) => {
    const errors = {};

    if (!values.email) {
        errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
        errors.email = 'Invalid email address';
    }

    if (!values.password) {
        errors.password = 'Password is required';
    }

    return errors;
};

export const validateRegisterForm = (values) => {
    const errors = {};

    if (!values.name?.trim()) {
        errors.name = 'Name is required';
    } else if (values.name.length < 2) {
        errors.name = 'Name must be at least 2 characters';
    }

    if (!values.email) {
        errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
        errors.email = 'Invalid email address';
    }

    if (!values.password) {
        errors.password = 'Password is required';
    } else if (!validatePassword(values.password)) {
        errors.password = 'Password must be at least 6 characters and contain a number';
    }

    if (values.phone && !validatePhone(values.phone.replace(/\D/g, ''))) {
        errors.phone = 'Invalid phone number';
    }

    return errors;
};
