import { TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

interface BackButtonProps {
  onPress: () => void;
  color?: string;
}

export const BackButton = ({ onPress, color = "#E4E4ED" }: BackButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Svg width="31" height="14" viewBox="0 0 31 14" fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 6.96045C4.0339 8.42373 7.31638 10.8362 9.80791 14C9.76836 12.1017 9.0565 10.1638 8.02825 8.18644L30.887 8.18644V5.89266L8.02825 5.89266C8.9774 4.27119 9.57062 2.33333 9.72881 9.53674e-07C6.9209 3.20339 3.83616 5.77401 0 6.96045Z"
          fill={color}
        />
      </Svg>
    </TouchableOpacity>
  );
};
