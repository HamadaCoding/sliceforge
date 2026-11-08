FROM php:8.2-cli

# تثبيت الحزم المطلوبة للاراول وتركيب الـ Extensions
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip

# تثبيت Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# تحديد مسار العمل
WORKDIR /var/www/html
COPY . .

# تثبيت حزم الباك إند
RUN composer install --no-dev --optimize-autoloader

# فتح البورت اللي بتستخدمه رندر
EXPOSE 10000

# تشغيل السيرفر والمايجريشن تلقائياً أول ما الخدمة تبدأ
CMD php artisan config:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000