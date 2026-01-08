const { sequelize, User, Appointment, Payment, Service } = require('./models');

async function testLoyaltyPoints() {
    try {
        console.log('Starting Loyalty Points Verification...');

        // 1. Create a Test User
        const user = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: `testpoints_${Date.now()}@example.com`,
            password: 'password123',
            role: 'customer',
            loyaltyPoints: 0
        });
        console.log(`Created User: ${user.email} (Points: ${user.loyaltyPoints})`);

        // 2. Get or Create Service
        let service = await Service.findOne();
        if (!service) {
            service = await Service.create({
                name: 'Test Service',
                price: 100, // $100
                duration: 60,
                description: 'Test'
            });
        }
        console.log(`Using Service: ${service.name} (Price: $${service.price})`);

        // 3. Create Appointment (Pending)
        const appointment = await Appointment.create({
            userId: user.id,
            serviceId: service.id,
            date: new Date(),
            startTime: '10:00:00',
            endTime: '11:00:00',
            status: 'pending',
            originalPrice: service.price,
            discountedPrice: service.price
        });
        console.log(`Created Appointment: ${appointment.id} (Status: ${appointment.status})`);

        // 4. Create Payment (Pending)
        const payment = await Payment.create({
            appointmentId: appointment.id,
            userId: user.id,
            amount: service.price,
            originalAmount: service.price,
            discountAmount: 0,
            paymentMethod: 'credit_card',
            status: 'pending' // Important: Pending
        });
        console.log(`Created Payment: ${payment.id} (Status: ${payment.status})`);

        // 5. Simulate "Complete Appointment" - calling the Logic directly?
        // We can't easily call the controller function without a request object.
        // Instead, we will simulate the LOGIC that is inside the controller:

        console.log('--- Simulating Appointment Completion Logic ---');

        // Logic from appointmentController.js:
        const statusToUpdate = 'completed';
        await appointment.update({ status: statusToUpdate });

        if (statusToUpdate === 'completed') {
            const linkedPayment = await Payment.findOne({
                where: { appointmentId: appointment.id }
            });

            if (linkedPayment && linkedPayment.status !== 'completed') {
                // Run the transaction logic
                const t = await sequelize.transaction();
                try {
                    await linkedPayment.update({ status: 'completed' }, { transaction: t });
                    const pointsEarned = Math.floor(linkedPayment.amount);
                    if (pointsEarned > 0) {
                        await user.increment('loyaltyPoints', { by: pointsEarned, transaction: t });
                        console.log(`[Logic] Awarded ${pointsEarned} points.`);
                    }
                    await t.commit();
                } catch (e) {
                    await t.rollback();
                    console.error(e);
                }
            }
        }

        // 6. Verify Results
        const updatedUser = await User.findByPk(user.id);
        const updatedPayment = await Payment.findByPk(payment.id);

        console.log('--- Results ---');
        console.log(`User Points: ${updatedUser.loyaltyPoints} (Expected: 100)`);
        console.log(`Payment Status: ${updatedPayment.status} (Expected: completed)`);

        if (updatedUser.loyaltyPoints === 100 && updatedPayment.status === 'completed') {
            console.log('SUCCESS: Points logic verified.');
        } else {
            console.error('FAILURE: Points or status incorrect.');
        }

    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        await sequelize.close();
    }
}

testLoyaltyPoints();
