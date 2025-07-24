import { useGLTF } from "@react-three/drei";
import { JSX, useEffect } from "react";
import { MeshStandardMaterial, SkinnedMesh } from "three";

const Tavern = ({ props }: { props?: JSX.IntrinsicElements["group"] }) => {
  const { nodes, materials } = useGLTF(
    "/3d-models/postprocessing-model/Cozy Tavern - First Floor 2.glb"
  );

  useEffect(() => {
    const mat = materials.mat12 as MeshStandardMaterial;
    mat.color.multiplyScalar(10);
    mat.toneMapped = false;
  }, [materials]);
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={(nodes.group950387495 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.group1572556094 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.group1636002290 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group1356016110 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group1241380022 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group1221757001 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group1857547615 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group464377065 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group1352688881 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group1682755110 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group904439403 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group693038625 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.group1930107198 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group336973742 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group1570457038 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group836287082 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group1149412887 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.group577751770 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group967203470 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group688152922 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group1377921775 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group193084205 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group1563204207 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.group936772768 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group1990873338 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group1708998506 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group1568561 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group1015133632 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group425200879 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group1242951019 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group1695546215 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group118941673 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group872986465 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group315192495 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group1682788618 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group1979090587 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group843582486 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group661073816 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group1276080923 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group2142956251 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group853732989 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.group681969337 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group31063136 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group712205421 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group523198590 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group735875327 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group1390133749 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.group611619335 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.group1022229644 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.group489308278 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.group1273097829 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.group1570535490 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.group69729533 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.group896477974 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.group1221759621 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.group1459075141 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group1943334311 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.group1645849517 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.group1702477019 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.group865258944 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.group656860610 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group2141588525 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group271794245 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.group54216191 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group1400167831 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group1677122294 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group887284349 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.group618407586 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.group2089016711 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh438481708 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh438481708_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1929893691 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1929893691_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1949409895 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1949409895_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1954645812 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1954645812_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh991228171 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh991228171_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh843379189 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh843379189_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1133682779 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1133682779_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1367768094 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1367768094_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh140025430 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh140025430_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1085623178 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1085623178_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh565034822 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh565034822_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1894878210 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1894878210_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh602801427 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh602801427_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1194886708 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1194886708_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1920157806 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1920157806_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh158674953 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh158674953_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1048842110 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1048842110_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2090022496 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2090022496_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh75096561 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh75096561_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1444274950 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1444274950_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh446515291 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh446515291_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh274157369 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh274157369_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1504009380 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1504009380_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1105523390 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1105523390_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1793249796 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1793249796_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1371560890 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1371560890_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh636330650 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh636330650_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh829764210 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh829764210_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1376020951 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1376020951_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2142156169 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh2142156169_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1818792853 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1818792853_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh544895962 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh544895962_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1329454405 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1329454405_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh823628293 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh823628293_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2083873717 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2083873717_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh194397182 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh194397182_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1973211180 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1973211180_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1509509364 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1509509364_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1160883401 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1160883401_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh769335857 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh769335857_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh14319087 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh14319087_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh657070081 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh657070081_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1310953146 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1310953146_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh692190474 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh692190474_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh503999704 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh503999704_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh353731961 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh353731961_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1095069681 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1095069681_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1212368008 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1212368008_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1093949087 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1093949087_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh736277926 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh736277926_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1246660916 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1246660916_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh955686560 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh955686560_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1396106963 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1396106963_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1396106963_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1867519670 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1867519670_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2090408128 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2090408128_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1289400496 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1289400496_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1934359918 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1934359918_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1792944174 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1792944174_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1792944174_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh177049606 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh177049606_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh252744464 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh252744464_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1848056104 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1848056104_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1408592774 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1408592774_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh776721842 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh776721842_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh776721842_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1744480401 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1744480401_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1744480401_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh603860966 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh603860966_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh603860966_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1273797586 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1273797586_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1035564931 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1035564931_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh980184241 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh980184241_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh475617870 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh475617870_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1310161378 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1310161378_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1622541033 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1622541033_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1963350547 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1963350547_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1193521644 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1193521644_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2006302553 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2006302553_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1860663062 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1860663062_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1538622810 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1538622810_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1873854346 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1873854346_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1471690182 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1471690182_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1471690182_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1615770447 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1615770447_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1615770447_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1167693631 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1167693631_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1506516243 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1506516243_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh648782406 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh648782406_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1752917619 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1752917619_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh187353352 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh187353352_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh187353352_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1275488006 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1275488006_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1192049715 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1192049715_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1192049715_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh382967373 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh382967373_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1312624424 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1312624424_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1035783233 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1035783233_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1791186099 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1791186099_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1247444962 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1247444962_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh2096978785 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2096978785_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh757236804 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh757236804_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh465848376 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh465848376_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2087490198 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh2087490198_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2117935270 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2117935270_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1942221767 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1942221767_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh577226352 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh577226352_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2095591070 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh2095591070_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh236073688 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh236073688_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1094525171 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1094525171_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh931849249 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh931849249_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh753411363 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh753411363_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh176944664 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh176944664_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2112915796 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh2112915796_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh59403559 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh59403559_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh75347226 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh75347226_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1962817986 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1962817986_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh918647937 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh918647937_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1460588458 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1460588458_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2095649510 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2095649510_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1972025384 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1972025384_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh557901928 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh557901928_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1688536916 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1688536916_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh42621473 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh42621473_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1598237087 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1598237087_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1196793384 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1196793384_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1641252264 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1641252264_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh586643819 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh586643819_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1746642833 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1746642833_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1746642833_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh949238222 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh949238222_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh783519536 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh783519536_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2089415401 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2089415401_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh31105394 as SkinnedMesh).geometry}
        material={materials.mat11}
      />
      <mesh
        geometry={(nodes.mesh31105394_1 as SkinnedMesh).geometry}
        material={materials.mat9}
      />
      <mesh
        geometry={(nodes.mesh1883961781 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1883961781_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1099449222 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1099449222_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1099449222_2 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1099449222_3 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh874634900 as SkinnedMesh).geometry}
        material={materials.mat11}
      />
      <mesh
        geometry={(nodes.mesh874634900_1 as SkinnedMesh).geometry}
        material={materials.mat9}
      />
      <mesh
        geometry={(nodes.mesh777026776 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh777026776_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh170940021 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh170940021_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1899181592 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1899181592_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1814692521 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1814692521_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1012775641 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1012775641_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1892559147 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1892559147_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2109292176 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2109292176_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh661998338 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh661998338_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh92065160 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh92065160_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh470576081 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh470576081_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1459498328 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1459498328_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1459498328_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh258319555 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh258319555_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh258319555_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1390421525 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1390421525_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1390421525_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1948027451 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1948027451_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1975296323 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1975296323_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1235951124 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1235951124_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh209874011 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh209874011_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh55715330 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh55715330_1 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh55715330_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1784176932 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1784176932_1 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh1409490378 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1409490378_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1349429739 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1349429739_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1349429739_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1629217661 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1629217661_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1377569298 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh1377569298_1 as SkinnedMesh).geometry}
        material={materials.mat5}
      />
      <mesh
        geometry={(nodes.mesh1377569298_2 as SkinnedMesh).geometry}
        material={materials.mat4}
      />
      <mesh
        geometry={(nodes.mesh1377569298_3 as SkinnedMesh).geometry}
        material={materials.mat1}
      />
      <mesh
        geometry={(nodes.mesh1248452079 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1248452079_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1248452079_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh204155152 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh204155152_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1479485165 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1479485165_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1610604143 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1610604143_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1610604143_2 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1610604143_3 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1807347518 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1807347518_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1807347518_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1807347518_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1140548557 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1140548557_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1140548557_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1140548557_3 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1806329641 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1806329641_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1806329641_2 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1829237646 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh1829237646_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1829237646_2 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh1829237646_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1482380847 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1482380847_1 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh1482380847_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1482380847_3 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1482380847_4 as SkinnedMesh).geometry}
        material={materials.mat24}
      />
      <mesh
        geometry={(nodes.mesh1523682768 as SkinnedMesh).geometry}
        material={materials.mat24}
      />
      <mesh
        geometry={(nodes.mesh1523682768_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1523682768_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1523682768_3 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1523682768_4 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh1760430014 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1760430014_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1760430014_2 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1760430014_3 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1760430014_4 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh945519177 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh945519177_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh945519177_2 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh945519177_3 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh945519177_4 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh945519177_5 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh945519177_6 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1304842311 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1304842311_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh765429965 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh765429965_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh765429965_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh980185240 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh980185240_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh980185240_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh980185240_3 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1722098415 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1722098415_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1722098415_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1722098415_3 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh1722098415_4 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh381701414 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh381701414_1 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh381701414_2 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh880162740 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh880162740_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh880162740_2 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh976322198 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh976322198_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh976322198_2 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh779593301 as SkinnedMesh).geometry}
        material={materials.mat8}
      />
      <mesh
        geometry={(nodes.mesh779593301_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh779593301_2 as SkinnedMesh).geometry}
        material={materials.mat14}
      />
      <mesh
        geometry={(nodes.mesh2055230432 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh2055230432_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1217351022 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1217351022_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1217351022_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh822585693 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh822585693_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh822585693_2 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1261245263 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1261245263_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1261245263_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1318408733 as SkinnedMesh).geometry}
        material={materials.mat8}
      />
      <mesh
        geometry={(nodes.mesh1318408733_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1318408733_2 as SkinnedMesh).geometry}
        material={materials.mat14}
      />
      <mesh
        geometry={(nodes.mesh343966361 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh343966361_1 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh343966361_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh343966361_3 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh1235923433 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1235923433_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2111492838 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh2111492838_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh2111492838_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2111492838_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh194961010 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh194961010_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh194961010_2 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh194961010_3 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh836147839 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh836147839_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh836147839_2 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh836147839_3 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1945837166 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh1945837166_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1945837166_2 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1945837166_3 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh2001532617 as SkinnedMesh).geometry}
        material={materials.mat9}
      />
      <mesh
        geometry={(nodes.mesh2001532617_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2001532617_2 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh2001532617_3 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh2001532617_4 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh2001532617_5 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh2001532617_6 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1222412864 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1222412864_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1222412864_2 as SkinnedMesh).geometry}
        material={materials.mat1}
      />
      <mesh
        geometry={(nodes.mesh1222412864_3 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1222412864_4 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh794461706 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh794461706_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh794461706_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh794461706_3 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh335318965 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh335318965_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh335318965_2 as SkinnedMesh).geometry}
        material={materials.mat4}
      />
      <mesh
        geometry={(nodes.mesh335318965_3 as SkinnedMesh).geometry}
        material={materials.mat9}
      />
      <mesh
        geometry={(nodes.mesh335318965_4 as SkinnedMesh).geometry}
        material={materials.mat3}
      />
      <mesh
        geometry={(nodes.mesh335318965_5 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh858253853 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh858253853_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1180391240 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1180391240_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1757439203 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1757439203_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh690640881 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh690640881_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh229022087 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh229022087_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh91050024 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh91050024_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh120466041 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh120466041_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh2079351214 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2079351214_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1486557878 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1486557878_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1702322313 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1702322313_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1397696664 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1397696664_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh854476401 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh854476401_1 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh854476401_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh329797297 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh329797297_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1203594532 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1203594532_1 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1203594532_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1203594532_3 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1044413411 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1044413411_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1044413411_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1071117106 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1071117106_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1071117106_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1071117106_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1071117106_4 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh843179588 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh843179588_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh858117732 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh858117732_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh188180022 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh188180022_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh895599401 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh895599401_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh895599401_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh617160531 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh617160531_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh55794704 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh55794704_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1911125301 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1911125301_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1620126085 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1620126085_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh645207918 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh645207918_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh645207918_2 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh645207918_3 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh645207918_4 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh645207918_5 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh645207918_6 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh453581157 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh453581157_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh453581157_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh485449808 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh485449808_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1627728751 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1627728751_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1627728751_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1437986198 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1437986198_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh191325282 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh191325282_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh191325282_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh502351941 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh502351941_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh502351941_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh502351941_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh292971933 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh292971933_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1877781147 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1877781147_1 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1877781147_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1877781147_3 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1370472195 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1370472195_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1370472195_2 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1370472195_3 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1693041364 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1693041364_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1693041364_2 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1693041364_3 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh713021524 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh713021524_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh713021524_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh713021524_3 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh945264907 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh945264907_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh945264907_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh945264907_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1592880815 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1592880815_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1520958368 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1520958368_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1520958368_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1072805274 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1072805274_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1072805274_2 as SkinnedMesh).geometry}
        material={materials.mat1}
      />
      <mesh
        geometry={(nodes.mesh1072805274_3 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1873881110 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1873881110_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1873881110_2 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh1873881110_3 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh1448238423 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1448238423_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1448238423_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh805801240 as SkinnedMesh).geometry}
        material={materials.mat8}
      />
      <mesh
        geometry={(nodes.mesh805801240_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh2099851251 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh2099851251_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2099851251_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh2049786020 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2049786020_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh2049786020_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2049786020_3 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh2049786020_4 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1545384908 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1545384908_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1687862922 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1687862922_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1225389793 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1225389793_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1060450140 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1060450140_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh383149416 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh383149416_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1935196641 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1935196641_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh796779557 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh796779557_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh69840951 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh69840951_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh2019208500 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh2019208500_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh372497608 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh372497608_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1205811118 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1205811118_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh537924794 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh537924794_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh49121811 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh49121811_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1333329252 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh1333329252_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1333329252_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1333329252_3 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh1813574589 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh1813574589_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1813574589_2 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh1178064293 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1178064293_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1178064293_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1178064293_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh747927410 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh747927410_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh747927410_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh765262060 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh765262060_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh765262060_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1673085950 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1673085950_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1868020864 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1868020864_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1868020864_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh57482883 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh57482883_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh57482883_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2075708629 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh2075708629_1 as SkinnedMesh).geometry}
        material={materials.mat8}
      />
      <mesh
        geometry={(nodes.mesh2075708629_2 as SkinnedMesh).geometry}
        material={materials.mat14}
      />
      <mesh
        geometry={(nodes.mesh1633990099 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh1633990099_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1633990099_2 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh805323696 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh805323696_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh406415189 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh406415189_1 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh406415189_2 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh453598080 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh453598080_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1326710940 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1326710940_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh592554149 as SkinnedMesh).geometry}
        material={materials.mat8}
      />
      <mesh
        geometry={(nodes.mesh592554149_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh592554149_2 as SkinnedMesh).geometry}
        material={materials.mat14}
      />
      <mesh
        geometry={(nodes.mesh775391072 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh775391072_1 as SkinnedMesh).geometry}
        material={materials.mat11}
      />
      <mesh
        geometry={(nodes.mesh775391072_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh775391072_3 as SkinnedMesh).geometry}
        material={materials.mat10}
      />
      <mesh
        geometry={(nodes.mesh775391072_4 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh775391072_5 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh775391072_6 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1736478075 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1736478075_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1612428362 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1612428362_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh41030402 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh41030402_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1422921269 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1422921269_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1422921269_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh330241672 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh330241672_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1294191787 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1294191787_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh39729543 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh39729543_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1250292459 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1250292459_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1250292459_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1250292459_3 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1841294687 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1841294687_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1841294687_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1841294687_3 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh587542350 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh587542350_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh587542350_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh19649914 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh19649914_1 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh19649914_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1577898345 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1577898345_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh452629395 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh452629395_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1470394581 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1470394581_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1470394581_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1331934695 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1331934695_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1331934695_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1331934695_3 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1869401787 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1869401787_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1257881861 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1257881861_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1907748885 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1907748885_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh64598502 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh64598502_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh64598502_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1889872095 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1889872095_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1889872095_2 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh892830155 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh892830155_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh892830155_2 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh850508387 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh850508387_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh850508387_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1649343743 as SkinnedMesh).geometry}
        material={materials.mat8}
      />
      <mesh
        geometry={(nodes.mesh1649343743_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1649343743_2 as SkinnedMesh).geometry}
        material={materials.mat14}
      />
      <mesh
        geometry={(nodes.mesh727369736 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh727369736_1 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh727369736_2 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh1000603159 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1000603159_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh948238057 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh948238057_1 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh948238057_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh689097865 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh689097865_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1919918777 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1919918777_1 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh1919918777_2 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh1591757079 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1591757079_1 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh1591757079_2 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh1052696900 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1052696900_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1061252987 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1061252987_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1301056296 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1301056296_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh281163314 as SkinnedMesh).geometry}
        material={materials.mat11}
      />
      <mesh
        geometry={(nodes.mesh281163314_1 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh81328871 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh81328871_1 as SkinnedMesh).geometry}
        material={materials.mat11}
      />
      <mesh
        geometry={(nodes.mesh462977224 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh462977224_1 as SkinnedMesh).geometry}
        material={materials.mat11}
      />
      <mesh
        geometry={(nodes.mesh650919509 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh650919509_1 as SkinnedMesh).geometry}
        material={materials.mat11}
      />
      <mesh
        geometry={(nodes.mesh650919509_2 as SkinnedMesh).geometry}
        material={materials.mat9}
      />
      <mesh
        geometry={(nodes.mesh650919509_3 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh1536309346 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1536309346_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1101690769 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1101690769_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1101690769_2 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh1199539450 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1199539450_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1199539450_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1199539450_3 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh282305452 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh282305452_1 as SkinnedMesh).geometry}
        material={materials.mat4}
      />
      <mesh
        geometry={(nodes.mesh282305452_2 as SkinnedMesh).geometry}
        material={materials.mat5}
      />
      <mesh
        geometry={(nodes.mesh282305452_3 as SkinnedMesh).geometry}
        material={materials.mat3}
      />
      <mesh
        geometry={(nodes.mesh2091576359 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh2091576359_1 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh2091576359_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh2091576359_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1678713314 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1678713314_1 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1678713314_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1678713314_3 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1818834863 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1818834863_1 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1818834863_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1818834863_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1496603682 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh1496603682_1 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh1496603682_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1361089624 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1361089624_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh586821253 as SkinnedMesh).geometry}
        material={materials.mat4}
      />
      <mesh
        geometry={(nodes.mesh586821253_1 as SkinnedMesh).geometry}
        material={materials.mat5}
      />
      <mesh
        geometry={(nodes.mesh586821253_2 as SkinnedMesh).geometry}
        material={materials.mat3}
      />
      <mesh
        geometry={(nodes.mesh586821253_3 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1909491717 as SkinnedMesh).geometry}
        material={materials.mat9}
      />
      <mesh
        geometry={(nodes.mesh1909491717_1 as SkinnedMesh).geometry}
        material={materials.mat10}
      />
      <mesh
        geometry={(nodes.mesh2142783881 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh2142783881_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh227225470 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh227225470_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh227225470_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh642537923 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh642537923_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh94359360 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh94359360_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1299513021 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1299513021_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1299513021_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1992381615 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1992381615_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1992381615_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1992381615_3 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh2014910026 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh2014910026_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh2014910026_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh219755418 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh219755418_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh219755418_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh618023429 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh618023429_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1968601204 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1968601204_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1968601204_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1968601204_3 as SkinnedMesh).geometry}
        material={materials.mat12}
      />
      <mesh
        geometry={(nodes.mesh36625953 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh36625953_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh36625953_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh36625953_3 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh36625953_4 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1919482083 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1919482083_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1919482083_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1919482083_3 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1919482083_4 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1872650464 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1872650464_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1872650464_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1872650464_3 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1872650464_4 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh428056493 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh428056493_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh428056493_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh428056493_3 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh428056493_4 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1581084696 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1581084696_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1581084696_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1581084696_3 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1581084696_4 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh335773047 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh335773047_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh335773047_2 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh335773047_3 as SkinnedMesh).geometry}
        material={materials.mat11}
      />
      <mesh
        geometry={(nodes.mesh1009089638 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1009089638_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1009089638_2 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh409571200 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh409571200_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh409571200_2 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh246483081 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh246483081_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh246483081_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh246483081_3 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1698681086 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1698681086_1 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1698681086_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1698681086_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh87193513 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh87193513_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh87193513_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh87193513_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh87193513_4 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh754962241 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh754962241_1 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh754962241_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1543404642 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1543404642_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1543404642_2 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh125015847 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh125015847_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh125015847_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh125015847_3 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh125015847_4 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh125015847_5 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh1280995885 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1280995885_1 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1280995885_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1280995885_3 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1280995885_4 as SkinnedMesh).geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={(nodes.mesh1280995885_5 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1429652333 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1429652333_1 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh1429652333_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1429652333_3 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh1892221299 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1892221299_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1892221299_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1892221299_3 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh1892221299_4 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1892221299_5 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh850046123 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh850046123_1 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh850046123_2 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh850046123_3 as SkinnedMesh).geometry}
        material={materials.mat22}
      />
      <mesh
        geometry={(nodes.mesh850046123_4 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh850046123_5 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh1092054928 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1092054928_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1092054928_2 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh1092054928_3 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1922305702 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1922305702_1 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1922305702_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1922305702_3 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1770687957 as SkinnedMesh).geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={(nodes.mesh1770687957_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1770687957_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1770687957_3 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh1770687957_4 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1770687957_5 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh220333156 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh220333156_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh220333156_2 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh220333156_3 as SkinnedMesh).geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={(nodes.mesh1078776977 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1078776977_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1078776977_2 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1132611263 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1132611263_1 as SkinnedMesh).geometry}
        material={materials.mat2}
      />
      <mesh
        geometry={(nodes.mesh1132611263_2 as SkinnedMesh).geometry}
        material={materials.mat0}
      />
      <mesh
        geometry={(nodes.mesh1480383765 as SkinnedMesh).geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={(nodes.mesh1480383765_1 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
      <mesh
        geometry={(nodes.mesh1480383765_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1480383765_3 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1480383765_4 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1480383765_5 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1718261112 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1718261112_1 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1148679548 as SkinnedMesh).geometry}
        material={materials.mat19}
      />
      <mesh
        geometry={(nodes.mesh1148679548_1 as SkinnedMesh).geometry}
        material={materials.mat16}
      />
      <mesh
        geometry={(nodes.mesh1148679548_2 as SkinnedMesh).geometry}
        material={materials.mat15}
      />
      <mesh
        geometry={(nodes.mesh1148679548_3 as SkinnedMesh).geometry}
        material={materials.mat20}
      />
      <mesh
        geometry={(nodes.mesh1148679548_4 as SkinnedMesh).geometry}
        material={materials.mat17}
      />
    </group>
  );
};

export default Tavern;

useGLTF.preload(
  "/3d-models/postprocessing-model/Cozy Tavern - First Floor 2.glb"
);
