pipeline {
    agent {
        docker {
            image 'node:8-alpine'
            args '-p 3000:3000'
        }
    }
    environment {
        CI = 'true'
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'echo "test stage"'
            }
        }
        stage('Deliver') {
            steps {
                sh 'echo "test stage"'
            }
        }
    }
}