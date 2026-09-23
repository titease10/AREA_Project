# Stage 1: Configurer Android SDK avec Java 8
FROM ubuntu:18.04 as android-sdk
RUN apt update && apt install -y curl git unzip xz-utils zip libglu1-mesa openjdk-8-jdk wget cmake
ENV ANDROID_SDK_ROOT /usr/lib/android-sdk
RUN mkdir -p $ANDROID_SDK_ROOT && mkdir -p .android && touch .android/repositories.cfg
RUN wget -q -O sdk-tools.zip https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip && \
    unzip -q sdk-tools.zip -d $ANDROID_SDK_ROOT && \
    rm sdk-tools.zip
RUN yes | $ANDROID_SDK_ROOT/tools/bin/sdkmanager --licenses && \
    $ANDROID_SDK_ROOT/tools/bin/sdkmanager "build-tools;30.0.3" "platform-tools" "platforms;android-34" "sources;android-34"

# Stage 2: Construire l'application Flutter avec Java 11
FROM ubuntu:18.04
RUN apt update && apt install -y openjdk-11-jdk wget git unzip xz-utils zip libglu1-mesa curl cmake && \
    rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64
ENV ANDROID_SDK_ROOT /usr/lib/android-sdk

COPY --from=android-sdk $ANDROID_SDK_ROOT $ANDROID_SDK_ROOT

RUN chmod -R a+rwX $ANDROID_SDK_ROOT

RUN useradd -ms /bin/bash developer
USER developer
WORKDIR /home/developer

ENV FLUTTER_HOME /home/developer/flutter
RUN wget -q https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.16.3-stable.tar.xz && \
    tar -xJf flutter_linux_3.16.3-stable.tar.xz && \
    rm flutter_linux_3.16.3-stable.tar.xz
ENV PATH $PATH:$FLUTTER_HOME/bin
RUN flutter doctor

WORKDIR /app
COPY --chown=developer:developer . .
RUN flutter clean && flutter pub get && flutter build apk --release

USER root
ENTRYPOINT ["cp", "/app/build/app/outputs/flutter-apk/app-release.apk", "/apk/client.apk"]