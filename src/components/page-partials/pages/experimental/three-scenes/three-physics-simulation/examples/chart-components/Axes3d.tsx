import { ThemePalette } from "@/config/theme-colors.config";
import { useThemeStore } from "@/storage/themeStore";
import { Line, Text } from "@react-three/drei";
import { useMemo } from "react";

const tickColor = "#333";
const xAxisColor = "#ff4040";
const yAxisColor = "#40ff80";
const zAxisColor = "#4080ff";

const Axes3d = ({
  size = 6,
  tickEvery = 1,
}: {
  size?: number;
  tickEvery?: number;
}) => {
  const theme = useThemeStore((s) => s.selectedTheme);
  const ticks = useMemo(() => {
    return Array.from(
      {
        length: Math.floor((2 * size) / tickEvery) + 1,
      },
      (_, i) => -size + i * tickEvery
    );
  }, [size, tickEvery]);
  return (
    <group>
      <Line
        points={[
          [-size, 0, 0],
          [size, 0, 0],
        ]}
        color={xAxisColor}
        lineWidth={2}
      />
      <Line
        points={[
          [0, -size, 0],
          [0, size, 0],
        ]}
        color={yAxisColor}
        lineWidth={2}
      />
      <Line
        points={[
          [0, 0, -size],
          [0, 0, size],
        ]}
        color={zAxisColor}
        lineWidth={2}
      />

      {ticks.map((t) => {
        return (
          <group key={`tick-${t}`}>
            <Line
              points={[
                [t, 0, -size],
                [t, 0, size],
              ]}
              color={tickColor}
            />
            <Line
              points={[
                [t, -size, 0],
                [t, size, 0],
              ]}
              color={tickColor}
            />
            <Line
              points={[
                [-size, 0, t],
                [size, 0, t],
              ]}
              color={tickColor}
            />
            <Line
              points={[
                [-size, t, 0],
                [size, t, 0],
              ]}
              color={tickColor}
            />
            {t !== 0 && (
              <group>
                {/* x axis label */}
                <Text
                  position={[t, -0.15, 0.15]}
                  fontSize={0.25}
                  color={ThemePalette[theme].foreground}
                  anchorX="center"
                >
                  {t}
                </Text>

                {/* z axis label */}
                <Text
                  position={[0, -0.15, t]}
                  fontSize={0.25}
                  color={ThemePalette[theme].foreground}
                  anchorX="center"
                >
                  {t}
                </Text>

                {/* y axis label */}
                <Text
                  position={[-0.2, t, 0]}
                  fontSize={0.25}
                  color={ThemePalette[theme].foreground}
                  anchorX="center"
                >
                  {t}
                </Text>
              </group>
            )}
          </group>
        );
      })}
      {/* Позначення осей */}
      <Text
        position={[size + 0.4, 0, 0]}
        fontSize={0.4}
        color={xAxisColor}
        anchorX="center"
      >
        x
      </Text>
      <Text
        position={[0, size + 0.4, 0]}
        fontSize={0.4}
        color={yAxisColor}
        anchorX="center"
      >
        y
      </Text>
      <Text
        position={[0, 0, size + 0.4]}
        fontSize={0.4}
        color={zAxisColor}
        anchorX="center"
      >
        z
      </Text>
    </group>
  );
};

export default Axes3d;
