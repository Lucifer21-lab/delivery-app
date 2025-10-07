import DeliveryCard from './DeliveryCard';
import { FaTruck } from 'react-icons/fa';

const DeliveryList = ({ deliveries, onAccept, showAcceptButton = true, emptyMessage = "No deliveries found" }) => {
    if (deliveries.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FaTruck className="text-gray-300 text-6xl mx-auto mb-4" />
                <p className="text-gray-600 text-lg">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveries.map((delivery) => (
                <DeliveryCard
                    key={delivery._id}
                    delivery={delivery}
                    onAccept={onAccept}
                    showAcceptButton={showAcceptButton}
                />
            ))}
        </div>
    );
};

export default DeliveryList;
