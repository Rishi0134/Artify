pipeline {
    agent any

    stages {
     stage('Clone') {
       steps {
        git branch: 'main', url: 'https://github.com/madhvi2512/Artify-Virtual_Art_Gallery.git'
    }
}

        stage('Clean Old Containers') {
            steps {
                bat 'docker stop $(docker ps -q) || exit 0'
                bat 'docker rm $(docker ps -aq) || exit 0'
            }
        }

        stage('Build & Deploy') {
            steps {
                bat 'docker-compose up --build -d'
            }
        }

    }
}