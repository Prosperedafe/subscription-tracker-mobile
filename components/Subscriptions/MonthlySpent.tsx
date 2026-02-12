import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

export const MonthlySpent = () => {
    // const { user } = useAuth();
    // const totalSpending = useMemo(() => {
    //     const activeSubs = subscriptions.filter((sub) => sub.status === 'active');
    //     return activeSubs.reduce((total, sub) => {
    //         let monthlyPrice = sub.price;
    //         if (sub.frequency === 'daily') monthlyPrice = sub.price * 30;
    //         if (sub.frequency === 'weekly') monthlyPrice = sub.price * 4;
    //         if (sub.frequency === 'yearly') monthlyPrice = sub.price / 12;
    //         return total + monthlyPrice;
    //     }, 0);
    // }, [user]);

    const BLUR_INTENSITY = 40;
    return (
        <View style={styles.container}>
            <BlurView
                intensity={BLUR_INTENSITY}
                tint="dark"
                style={[StyleSheet.absoluteFill, styles.blur]}
                {...(Platform.OS === 'android' && { experimentalBlurMethod: 'dimezisBlurView' as const })}
            />
            <View style={styles.content}>
                <ThemedText type="subtitle" style={styles.icon}>$</ThemedText>
                <ThemedText type="subtitle" style={styles.value}>100</ThemedText>
                <ThemedText type="subtitle" style={styles.title}>Amount spent this month</ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        minHeight: 100,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 12,
    },
    blur: {
        borderRadius: 12,
    },
    content: {
        padding: 16,
        gap: 4,
    },
    icon: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
