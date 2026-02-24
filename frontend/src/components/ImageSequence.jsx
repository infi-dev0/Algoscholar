import React, { useState, useEffect, useRef } from 'react';

const ImageSequence = ({
    folderName,
    filePrefix,
    fileSuffix = '.jpg',
    frameCount,
    fps = 24,
    className = "",
    interactive = false
}) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const imagesRef = useRef([]);
    const imgRef = useRef(null);

    useEffect(() => {
        // Preload all images and hold a reference to prevent garbage collection
        const images = [];
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            const frameIndex = i.toString().padStart(3, '0');
            const fileName = `${filePrefix}${frameIndex}${fileSuffix}`;
            img.src = `/${folderName}/${encodeURIComponent(fileName)}`;
            images.push(img);
        }
        imagesRef.current = images;

        // If interactive, don't autoplay the interval.
        if (interactive) return;

        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev + 1) % frameCount);
        }, 1000 / fps);

        return () => clearInterval(interval);
    }, [folderName, filePrefix, fileSuffix, frameCount, fps, interactive]);

    // Smooth Cursor Parallax & Frame Scrubbing Interaction
    useEffect(() => {
        if (!interactive) return;

        let requestRef;
        const target = { x: 0, y: 0 };
        const current = { x: 0, y: 0 };
        let targetFrame = 0;

        const handleMouseMove = (e) => {
            // Parallax offsets
            const x = (e.clientX / window.innerWidth - 0.5) * 60;
            const y = (e.clientY / window.innerHeight - 0.5) * 60;
            target.x = x;
            target.y = y;

            // Frame scrubbing based on X position
            // Left side = frame 0, Right side = last frame
            const pct = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
            targetFrame = Math.floor(pct * (frameCount - 1));
        };

        const updateTransform = () => {
            // Smoothly interpolate current towards target
            current.x += (target.x - current.x) * 0.08;
            current.y += (target.y - current.y) * 0.08;

            // Apply frame update conditionally
            setCurrentFrame((prev) => {
                // A tiny bit of smoothing for the frame change is optional, 
                // but snapping to target Frame makes it feel more responsive to scrubbing
                return targetFrame;
            });

            if (imgRef.current) {
                // Apply a 3D tilt and translate
                const rotateX = current.y * -0.4;
                const rotateY = current.x * 0.4;
                imgRef.current.style.transform = `perspective(1000px) translate(${current.x}px, ${current.y}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
            requestRef = requestAnimationFrame(updateTransform);
        };

        window.addEventListener('mousemove', handleMouseMove);
        requestRef = requestAnimationFrame(updateTransform);

        // Reset if interaction stops
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(requestRef);
            if (imgRef.current) imgRef.current.style.transform = 'none';
        };
    }, [interactive]);

    const frameIndex = currentFrame.toString().padStart(3, '0');
    const fileName = `${filePrefix}${frameIndex}${fileSuffix}`;
    const imageSrc = imagesRef.current[currentFrame]?.src || `/${folderName}/${encodeURIComponent(fileName)}`;

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt="Animated Sequence"
            className={className}
            style={{ willChange: 'transform' }}
        />
    );
};

export default ImageSequence;
