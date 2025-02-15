"use client";

import dynamic from "next/dynamic";
import p5Types from "p5";
import { useRef } from "react";

const Sketch = dynamic(() => import('react-p5'), {
    loading: () => null,
    ssr: false
});

const P5Component = () => {
    let paddle: p5Types.Vector;
    let ball: p5Types.Vector;
    let ballSpeed: p5Types.Vector;
    let bricks: { position: p5Types.Vector, color: p5Types.Color }[] = [];
    const brickRows = 5;
    const brickWidth = 50;
    const brickHeight = 20;
    const paddleWidth = 100;
    const paddleHeight = 20;
    const ballRadius = 10;
    const brickColors = [
        '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF',
        '#33FFF5', '#F5FF33', '#FF8C33', '#8C33FF', '#33FF8C'
    ];

    const p5Ref = useRef<p5Types | null>(null);
    let gameCleared = false;

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5Ref.current = p5;
        p5.createCanvas(p5.windowWidth, p5.windowHeight - 50).parent(canvasParentRef);
        resetGame(p5);
    };

    const windowResized = (p5: p5Types) => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        resetGame(p5);
    };

    const resetGame = (p5: p5Types) => {
        paddle = p5.createVector(p5.width / 2 - paddleWidth / 2, p5.height - 50);
        ball = p5.createVector(p5.width / 2, p5.height / 2);
        ballSpeed = p5.createVector(10, -10);
        bricks = [];
        gameCleared = false;

        const brickCols = Math.floor(p5.width / (brickWidth + 10)); // キャンバスの幅に合わせて列数を計算

        for (let i = 0; i < brickRows; i++) {
            for (let j = 0; j < brickCols; j++) {
                const color = p5.color(brickColors[(i * brickCols + j) % brickColors.length]);
                bricks.push({ position: p5.createVector(j * (brickWidth + 10) + 5, i * (brickHeight + 10) + 30), color });
            }
        }

        p5.loop();
    };

    const draw = (p5: p5Types) => {
        p5.background(0);

        // Draw paddle
        p5.fill(255);
        p5.rect(paddle.x, paddle.y, paddleWidth, paddleHeight);

        // Draw ball
        p5.fill(255);
        p5.ellipse(ball.x, ball.y, ballRadius * 2);

        // Draw bricks
        for (const brick of bricks) {
            p5.fill(brick.color);
            p5.rect(brick.position.x, brick.position.y, brickWidth, brickHeight);
        }

        // Move ball
        ball.add(ballSpeed);

        // Ball collision with walls
        if (ball.x < ballRadius || ball.x > p5.width - ballRadius) {
            ballSpeed.x *= -1;
        }
        if (ball.y < ballRadius) {
            ballSpeed.y *= -1;
        }

        // Ball collision with paddle
        if (ball.y > paddle.y - ballRadius && ball.x > paddle.x && ball.x < paddle.x + paddleWidth) {
            ballSpeed.y *= -1;
            ballSpeed.x += p5.random(-1, 1); // Add random element to ball's x speed
        }

        // Ball collision with bricks
        for (let i = bricks.length - 1; i >= 0; i--) {
            const brick = bricks[i];
            if (ball.x + ballRadius > brick.position.x && ball.x - ballRadius < brick.position.x + brickWidth &&
                ball.y + ballRadius > brick.position.y && ball.y - ballRadius < brick.position.y + brickHeight) {
                bricks.splice(i, 1);
                ballSpeed.y *= -1;
                ballSpeed.x += p5.random(-1, 1); // Add random element to ball's x speed
                break;
            }
        }

        // Check if all bricks are cleared
        if (bricks.length === 0) {
            gameCleared = true;
            p5.noLoop();
        }

        // Ball out of bounds
        if (ball.y > p5.height) {
            p5.noLoop();
        }

        // Move paddle
        if (p5.mouseX > 0 && p5.mouseX < p5.width) {
            paddle.x = p5.mouseX - paddleWidth / 2;
        }

        // Display "Clear" message if game is cleared
        if (gameCleared) {
            p5.fill(255);
            p5.textSize(32);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.text("!!Clear!!", p5.width / 2, p5.height / 2);
        }
    };

    return (
        <div>
            <Sketch setup={setup} draw={draw} windowResized={windowResized} />
            <button onClick={() => p5Ref.current && resetGame(p5Ref.current)}>Restart</button>
        </div>
    );
};

export default P5Component;