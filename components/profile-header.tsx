
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

export function ProfileHeader() {
    const { user } = useAuth();
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Morning';
        if (hour < 14) return 'Afternoon';
        return 'Evening';
    }, []);

    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => router.push('/profile')}
            >
                <Image source={require('@/assets/icons/profile-icon.png')} style={styles.profileIcon} />
            </TouchableOpacity>
            <ThemedText type="default" style={styles.headerTitle}>{greeting}, {user?.name}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    profileIcon: {
        width: 32,
        height: 32,
        borderRadius: 22,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    editButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});