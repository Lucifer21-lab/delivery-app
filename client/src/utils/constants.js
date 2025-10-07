export const DELIVERY_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded'
};

export const USER_ROLES = {
    CLIENT: 'client',
    ADMIN: 'admin'
};

export const NOTIFICATION_TYPES = {
    DELIVERY_ACCEPTED: 'delivery_accepted',
    DELIVERY_COMPLETED: 'delivery_completed',
    PAYMENT_RECEIVED: 'payment_received',
    DEADLINE_APPROACHING: 'deadline_approaching',
    REQUEST_EXPIRED: 'request_expired'
};

export const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800'
};

export const STATUS_LABELS = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    expired: 'Expired'
};