pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                echo "Cloning..."
            }
        }

        stage('Install') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo "Build successful"
            }
        }
    }
}
