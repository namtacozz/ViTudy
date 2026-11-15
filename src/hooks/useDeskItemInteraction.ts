'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';

interface UseDeskItemInteractionProps {
  itemId: string;
  itemX: number;
  itemY: number;
  rotation: number;
  width: number;
  height: number;
  onDropCheck?: (latestX: number, latestY: number) => void;
}

export function useDeskItemInteraction({
  itemId,
  itemX,
  itemY,
  rotation,
  width,
  height,
  onDropCheck,
}: UseDeskItemInteractionProps) {
  const { 
    transform, 
    updateItemPosition, 
    setItemRotation, 
    selectItem, 
    bringToFront,
    flushSyncLocal
  } = useStudySpace();

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialItemX: number;
    initialItemY: number;
    latestX: number;
    latestY: number;
  }>({
    startX: 0,
    startY: 0,
    initialItemX: itemX,
    initialItemY: itemY,
    latestX: itemX,
    latestY: itemY,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Left click only
    if (e.button !== 0) return;
    
    // Ignore interactive element clicks
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('textarea') || 
      target.closest('a') ||
      target.closest('.interactive-control')
    ) {
      return;
    }

    e.stopPropagation();
    bringToFront(itemId);
    selectItem(itemId);
    setIsDragging(true);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialItemX: itemX,
      initialItemY: itemY,
      latestX: itemX,
      latestY: itemY,
    };

    let rafId: number | null = null;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaScreenX = moveEvent.clientX - dragRef.current.startX;
      const deltaScreenY = moveEvent.clientY - dragRef.current.startY;

      const deskRad = (-(transform.rotation || 0) * Math.PI) / 180;
      const unrotDx = deltaScreenX * Math.cos(deskRad) - deltaScreenY * Math.sin(deskRad);
      const unrotDy = deltaScreenX * Math.sin(deskRad) + deltaScreenY * Math.cos(deskRad);

      const deltaCanvasX = unrotDx / transform.scale;
      const deltaCanvasY = unrotDy / transform.scale;

      const newX = Math.round(dragRef.current.initialItemX + deltaCanvasX);
      const newY = Math.round(dragRef.current.initialItemY + deltaCanvasY);

      dragRef.current.latestX = newX;
      dragRef.current.latestY = newY;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          updateItemPosition(itemId, dragRef.current.latestX, dragRef.current.latestY);
          rafId = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      updateItemPosition(itemId, dragRef.current.latestX, dragRef.current.latestY);
      flushSyncLocal?.();
      if (onDropCheck) {
        onDropCheck(dragRef.current.latestX, dragRef.current.latestY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [itemId, itemX, itemY, transform.scale, transform.rotation, bringToFront, selectItem, updateItemPosition, flushSyncLocal, onDropCheck]);

  // Continuous 360 rotation handle with RAF throttling
  const handleRotateMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    bringToFront(itemId);
    selectItem(itemId);

    const itemWorldCenterX = itemX + width / 2;
    const itemWorldCenterY = itemY + height / 2;
    const deskRad = ((transform.rotation || 0) * Math.PI) / 180;
    const scaledX = itemWorldCenterX * transform.scale;
    const scaledY = itemWorldCenterY * transform.scale;
    const rotScaledX = scaledX * Math.cos(deskRad) - scaledY * Math.sin(deskRad);
    const rotScaledY = scaledX * Math.sin(deskRad) + scaledY * Math.cos(deskRad);
    const itemCenterX = rotScaledX + transform.x;
    const itemCenterY = rotScaledY + transform.y;

    const startMouseAngle = Math.atan2(e.clientY - itemCenterY, e.clientX - itemCenterX) * (180 / Math.PI);
    const startItemRotation = rotation;

    let rotRafId: number | null = null;
    let latestRot = rotation;

    const handleRotateMouseMove = (moveEvent: MouseEvent) => {
      const currentMouseAngle = Math.atan2(moveEvent.clientY - itemCenterY, moveEvent.clientX - itemCenterX) * (180 / Math.PI);
      const deltaAngle = currentMouseAngle - startMouseAngle;
      let rawRot = Math.round(startItemRotation + deltaAngle);
      // Magnetic snap to 0° within ±2.5° for crisp reading alignment
      const normalizedMod = ((rawRot % 360) + 360) % 360;
      if (normalizedMod <= 2.5 || normalizedMod >= 357.5) {
        rawRot = 0;
      }
      latestRot = rawRot;

      if (!rotRafId) {
        rotRafId = requestAnimationFrame(() => {
          setItemRotation(itemId, latestRot);
          rotRafId = null;
        });
      }
    };

    const handleRotateMouseUp = () => {
      if (rotRafId) {
        cancelAnimationFrame(rotRafId);
        rotRafId = null;
      }
      setItemRotation(itemId, latestRot);
      flushSyncLocal?.();
      window.removeEventListener('mousemove', handleRotateMouseMove);
      window.removeEventListener('mouseup', handleRotateMouseUp);
    };

    window.addEventListener('mousemove', handleRotateMouseMove);
    window.addEventListener('mouseup', handleRotateMouseUp);
  }, [itemId, itemX, itemY, width, height, rotation, transform.scale, transform.rotation, transform.x, transform.y, bringToFront, selectItem, setItemRotation, flushSyncLocal]);

  const handleRotateDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setItemRotation(itemId, 0);
    flushSyncLocal?.();
  }, [itemId, setItemRotation, flushSyncLocal]);

  return {
    isDragging,
    handleMouseDown,
    handleRotateMouseDown,
    handleRotateDoubleClick,
  };
}
