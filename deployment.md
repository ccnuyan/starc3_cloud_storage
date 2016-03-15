### node
    curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
    sudo apt-get install -y nodejs
### git
    sudo apt-get install -y git
    sudo git clone https://github.com/ccnuyan/starc3_cloud_storage
### build-essential
    sudo apt-get install -y build-essential
### npm
    sudo npm run itaobao
    sudo npm run build-web
### web
    docker rm -f cloud-web
    docker build -t cloud-web:0.0.1 -f Dockerfile.web .
    docker run -d -p 8100:8100 -v /root/source:/etc/source --name cloud-web cloud-web:0.0.1
    docker logs -f cloud-web
### api
    docker rm -f cloud-api
    docker build -t cloud-api:0.0.1 -f Dockerfile.api .
    docker run -d -p 3100:3100 -v /root/source:/etc/source --name cloud-api cloud-api:0.0.1
    docker logs -f cloud-api
