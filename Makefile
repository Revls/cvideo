dependencies:
	sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev ffmpeg && npm install -d

directories:
	mkdir -p server/tasks/frames server/tasks/videos

.PHONY: dependencies directories	
