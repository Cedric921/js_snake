window.onload = function () {
	var canvasWidth = 850;
	var canvasHeigth = 500;
	var context;
	var delay = 150;
	var blockSize = 10;
	var snakee;
	var applee;
	var widthInBlock = canvasWidth / blockSize;
	var heightInBlock = canvasHeigth / blockSize;
	var score;

	//la fonction a l'initial
	function init() {
		//creation d'un canvas
		var canvas = document.createElement('canvas');
		var page = document.getElementById('root');
		canvas.width = canvasWidth;
		canvas.height = canvasHeigth;
		canvas.style.border = '1px solid grey';
		canvas.className = "game";
		page.appendChild(canvas);
		context = canvas.getContext('2d');
		score = 0;
		//on cree le snake
		snakee = new Snake(
			[
				[6, 4],
				[5, 4],
				[4, 4],
			],
			'right'
		);

		applee = new Apple([10, 10]);

		refreshCanvas();
	}
	init();

	function refreshCanvas() {
		//dessiner dans le canvas avec le context
		snakee.advance();
		if (snakee.checkCollision()) {
			// GAME OVER
			gameOver();
		} else {
			if (snakee.isEatingApple(applee)) {
				// SNAKE EAT APPLE
				score++;
				snakee.ateApple = true;
				do {
					applee.setNewPosition();
					//we'll set a new position while the new position of apple is on snake
				} while (applee.isOnSnake(snakee));
			}
			context.clearRect(0, 0, canvasWidth, canvasHeigth);
			snakee.draw();
			applee.draw();
			drawScore();
			setTimeout(refreshCanvas, delay);
		}
		//for debug
		console.log(applee, snakee);
	}

	function drawBlock(ctx, position) {
		let x = position[0] * blockSize;
		let y = position[1] * blockSize;
		context.fillRect(x, y, blockSize, blockSize);
	}

	function gameOver() {
		context.save();
		context.fillText('Game over', 5, 15);
		context.fillText('Appuyer sur la touche espace pour jouer', 5, 30);
		context.restore();
	}

	function drawScore() {
		context.save();
		context.fillText(score.toString(), 5, canvasHeigth - 5);
		context.restore();
	}

	function restart() {
		//on cree le snake
		snakee = new Snake(
			[
				[6, 4],
				[5, 4],
				[4, 4],
			],
			'right'
		);
		
		score = 0; 
		applee = new Apple([10, 10]);
		refreshCanvas();
	}

	function Snake(body, direction) {
		this.body = body;
		this.direction = direction;
		this.ateApple = false;
		this.draw = function () {
			context.save();
			context.fillStyle = '#ff0000';
			for (let i = 0; i < this.body.length; i++) {
				drawBlock(context, this.body[i]);
			}
			context.restore();
		};
		this.advance = function () {
			var nextPosition = this.body[0].slice();
			switch (this.direction) {
				case 'left':
					nextPosition[0] -= 1;
					break;
				case 'right':
					nextPosition[0] += 1;
					break;
				case 'down':
					nextPosition[1] += 1;
					break;
				case 'up':
					nextPosition[1] -= 1;
					break;

				default:
					throw 'invalid direction';
			}

			this.body.unshift(nextPosition);
			if (!this.ateApple) {
				this.body.pop();
			} else {
				this.ateApple = false;
			}
		};
		this.setDirection = function (newDirection) {
			let allowedDirections;
			switch (this.direction) {
				case 'left':
				case 'right':
					allowedDirections = ['down', 'up'];
					break;
				case 'down':
				case 'up':
					allowedDirections = ['left', 'right'];
					break;

				default:
					throw 'invalid direction';
			}
			if (allowedDirections.indexOf(newDirection) > -1) {
				this.direction = newDirection;
			}
		};

		this.checkCollision = function () {
			let wallCollision = false;
			let snakeCollision = false;
			let head = this.body[0];
			let rest = this.body.slice(1);
			let snakeX = head[0];
			let snakeY = head[1];
			let minX = 0;
			let minY = 0;
			let maxX = widthInBlock - 1;
			let maxY = heightInBlock - 1;
			let isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
			let isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

			if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
				wallCollision = true;
			}
			for (let i in rest) {
				if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
					snakeCollision = true;
				}
			}
			return snakeCollision || wallCollision;
		};
		this.isEatingApple = function (appleToEat) {
			let head = this.body[0];
			if (
				head[0] === appleToEat.position[0] &&
				head[1] === appleToEat.position[1]
			) {
				return true;
			} else {
				return false;
			}
		};
	}

	function Apple(position) {
		this.position = position;
		this.draw = function () {
			context.save();
			context.fillStyle = '#33cc33';
			context.beginPath();
			let radius = blockSize / 2;
			let x = this.position[0] * blockSize + radius;
			let y = this.position[1] * blockSize + radius;
			context.arc(x, y, radius, 0, Math.PI * 2, true);
			context.fill();
			context.restore();
		};
		this.setNewPosition = function () {
			let newX = Math.round(Math.random() * (widthInBlock - 1));
			let newY = Math.round(Math.random() * (heightInBlock - 1));
			this.position = [newX, newY];
		};
		this.isOnSnake = function (snakeToCheck) {
			let isOnSnake = false;
			for (let i in snakeToCheck.body) {
				if (
					this.position[0] === snakeToCheck.body[i][0] &&
					this.position[1] === snakeToCheck.body[i][1]
				) {
					isOnSnake = true;
				}
				return isOnSnake;
			}
		};
	}

	document.onkeydown = function handleKeyDown(e) {
		let key = e.keyCode;
		let newDirection;
		switch (key) {
			case 37:
				newDirection = 'left';
				break;
			case 38:
				newDirection = 'up';
				break;
			case 39:
				newDirection = 'right';
				break;
			case 40:
				newDirection = 'down';
				break;
			case 32:
				restart();
				return;
			default:
				return;
		}
		snakee.setDirection(newDirection);
	};
};
