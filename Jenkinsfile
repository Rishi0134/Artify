pipeline {
    agent any

    stages {

        stage('Clone') {
            steps {
                git 'https://github.com/madhvi2512/Artify-Virtual_Art_Gallery.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker-compose build'
            }
        }

        stage('Deploy Containers') {
            steps {
                bat 'docker-compose down'
                bat 'docker-compose up -d'
            }
        }

    }
}
