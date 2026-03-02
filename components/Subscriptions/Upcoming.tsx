import { FlatList, Text, View } from "react-native";
import { ThemedText } from "../themed-text";

interface UpcomingSubscriptionsProps {
  data: any[];
}

export const UpcomingSubscriptions = ({ data }: UpcomingSubscriptionsProps) => {
  console.log(data);
  return (
    <View>
      <ThemedText>Upcoming Payments</ThemedText>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
};
