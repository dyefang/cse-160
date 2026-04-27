function drawKoala(matrix) {
  const gray = [0.55, 0.55, 0.55, 1.0];
  const darkGray = [0.25, 0.25, 0.25, 1.0];
  const black = [0.02, 0.02, 0.02, 1.0];
  const white = [0.9, 0.9, 0.85, 1.0];
  const green = [0.3, 0.55, 0.25, 1.0];
  const brown = [0.45, 0.25, 0.1, 1.0];

  let e = gExplodeAmount;
  let M = new Matrix4();

  // Tree branch stays still
  M.set(matrix);
  M.translate(0, -1.75, 0.35);
  M.rotate(90, 0, 0, 1);
  M.scale(0.14, 2.4, 0.14);
  drawCylinder(M, brown);

  // Body
  M.set(matrix);
  M.translate(0, 0, 0.3 * e);
  M.scale(0.9, 1.2, 0.55);
  drawCube(M, gray);

  // Belly
  M.set(matrix);
  M.translate(0, -0.05, -0.31 - 0.7 * e);
  M.scale(0.55, 0.75, 0.08);
  drawCube(M, white);

  // Head
  M.set(matrix);
  M.translate(0, 0.95 + 0.8 * e, 0);
  M.scale(0.75, 0.65, 0.55);
  drawCube(M, gray);

  // Left ear
  M.set(matrix);
  M.translate(-0.62 - 0.55 * e, 1.18 + 0.55 * e, 0);
  M.rotate(gEarAngle, 0, 0, 1);
  M.scale(0.35, 0.35, 0.25);
  drawCylinder(M, darkGray);

  // Right ear
  M.set(matrix);
  M.translate(0.62 + 0.55 * e, 1.18 + 0.55 * e, 0);
  M.rotate(-gEarAngle, 0, 0, 1);
  M.scale(0.35, 0.35, 0.25);
  drawCylinder(M, darkGray);

  // Nose
  M.set(matrix);
  M.translate(0, 0.85 + 0.55 * e, -0.45 - 0.65 * e);
  M.rotate(90, 1, 0, 0);
  M.scale(0.18, 0.12, 0.18);
  drawCylinder(M, black);

  // Left eye
  M.set(matrix);
  M.translate(-0.22 - 0.2 * e, 1.05 + 0.45 * e, -0.45 - 0.45 * e);
  M.scale(0.08, 0.08, 0.08);
  drawCube(M, black);

  // Right eye
  M.set(matrix);
  M.translate(0.22 + 0.2 * e, 1.05 + 0.45 * e, -0.45 - 0.45 * e);
  M.scale(0.08, 0.08, 0.08);
  drawCube(M, black);

  // Left arm
  M.set(matrix);
  M.translate(-0.65 - 0.8 * e, 0.25, 0);
  M.rotate(gLeftArmAngle, 1, 0, 0);
  M.scale(0.18, 0.75, 0.18);
  drawCube(M, gray);

  // Left hand
  M.set(matrix);
  M.translate(-0.65 - 1.0 * e, -0.18 - 0.3 * e, -0.08);
  M.rotate(gLeftArmAngle, 1, 0, 0);
  M.scale(0.22, 0.18, 0.22);
  drawCube(M, darkGray);

  // Right arm
  M.set(matrix);
  M.translate(0.65 + 0.8 * e, 0.25, 0);
  M.rotate(gRightArmAngle, 1, 0, 0);
  M.scale(0.18, 0.75, 0.18);
  drawCube(M, gray);

  // Right hand
  M.set(matrix);
  M.translate(0.65 + 1.0 * e, -0.18 - 0.3 * e, -0.08);
  M.rotate(gRightArmAngle, 1, 0, 0);
  M.scale(0.22, 0.18, 0.22);
  drawCube(M, darkGray);

  // Left upper leg
  M.set(matrix);
  M.translate(-0.32 - 0.45 * e, -0.85 - 0.45 * e, 0);
  M.rotate(gLeftLegAngle, 1, 0, 0);
  M.scale(0.22, 0.45, 0.22);
  drawCube(M, gray);

  // Left lower leg
  M.set(matrix);
  M.translate(-0.32 - 0.6 * e, -1.25 - 0.7 * e, 0);
  M.rotate(gLeftLegAngle, 1, 0, 0);
  M.rotate(gLeftKneeAngle, 1, 0, 0);
  M.scale(0.2, 0.4, 0.2);
  drawCube(M, gray);

  // Left foot
  M.set(matrix);
  M.translate(-0.32 - 0.75 * e, -1.58 - 0.9 * e, -0.12 - 0.25 * e);
  M.rotate(gLeftLegAngle, 1, 0, 0);
  M.rotate(gLeftKneeAngle, 1, 0, 0);
  M.rotate(gLeftFootAngle, 1, 0, 0);
  M.scale(0.28, 0.14, 0.35);
  drawCube(M, darkGray);

  // Right upper leg
  M.set(matrix);
  M.translate(0.32 + 0.45 * e, -0.85 - 0.45 * e, 0);
  M.rotate(gRightLegAngle, 1, 0, 0);
  M.scale(0.22, 0.45, 0.22);
  drawCube(M, gray);

  // Right lower leg
  M.set(matrix);
  M.translate(0.32 + 0.6 * e, -1.25 - 0.7 * e, 0);
  M.rotate(gRightLegAngle, 1, 0, 0);
  M.rotate(gRightKneeAngle, 1, 0, 0);
  M.scale(0.2, 0.4, 0.2);
  drawCube(M, gray);

  // Right foot
  M.set(matrix);
  M.translate(0.32 + 0.75 * e, -1.58 - 0.9 * e, -0.12 - 0.25 * e);
  M.rotate(gRightLegAngle, 1, 0, 0);
  M.rotate(gRightKneeAngle, 1, 0, 0);
  M.rotate(gRightFootAngle, 1, 0, 0);
  M.scale(0.28, 0.14, 0.35);
  drawCube(M, darkGray);

  // Leaf decoration
  M.set(matrix);
  M.translate(0.95, -1.55, 0.35);
  M.rotate(35, 0, 0, 1);
  M.scale(0.25, 0.08, 0.18);
  drawCube(M, green);
}