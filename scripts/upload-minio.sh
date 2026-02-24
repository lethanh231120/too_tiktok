#!/bin/bash

# Define MinIO credentials and settings
AWS_ACCESS_KEY_ID="vuluu2k"
AWS_SECRET_ACCESS_KEY="vuluu2kTest"
MINIO_URL="https://ss3.fastfol.io.vn"
BUCKET_NAME="tiktok-releases"

echo "🚀 Bắt đầu quá trình đưa bản cài đặt lên MinIO Server..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null
then
    echo "❌ Lỗi: Bạn chưa cài đặt AWS CLI. Vui lòng cài đặt AWS CLI để sử dụng tính năng upload này."
    exit 1
fi

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION="us-east-1"

# Create bucket if it doesn't exist
echo "📦 Kiểm tra và khởi tạo Bucket ($BUCKET_NAME)..."
aws s3 mb s3://$BUCKET_NAME --endpoint-url $MINIO_URL 2>/dev/null || true

# Set bucket policy to allow public reads
echo "🔒 Đang thiết lập quyền tải về public cho Bucket..."
cat <<EOF > policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:GetObject"],
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Resource": ["arn:aws:s3:::$BUCKET_NAME/*"]
    }
  ]
}
EOF
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://policy.json --endpoint-url $MINIO_URL 2>/dev/null || true
rm policy.json

# Upload specific built files to MinIO
echo "⚡ Tải lên các file cài đặt từ thư mục dist/ ..."
aws s3 cp dist/ s3://$BUCKET_NAME/ --recursive --exclude "*" --include "*.exe" --include "*.dmg" --include "*-mac.zip" --endpoint-url $MINIO_URL

# Extract version from package.json
VERSION=$(grep -m1 '"version"' package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')
echo "📝 Đang tạo tệp dữ liệu downloads_v$VERSION.json cho Landing Page..."

MAC_SILICON_FILE=$(basename "$(ls dist/*-arm64.dmg 2>/dev/null | head -n 1)")
MAC_INTEL_FILE=$(basename "$(ls dist/*.dmg 2>/dev/null | grep -v "arm64" | head -n 1)")
WINDOWS_FILE=$(ls dist/*.exe 2>/dev/null | grep "Setup" | head -n 1) # Prefer the setup file
if [ -z "$WINDOWS_FILE" ]; then
    WINDOWS_FILE=$(ls dist/*.exe 2>/dev/null | head -n 1)
fi
WINDOWS_FILE=$(basename "$WINDOWS_FILE")

# Generate JSON for specific version
mkdir -p landing/public
cat <<EOF > landing/public/downloads_v$VERSION.json
{
  "macSilicon": "$MINIO_URL/$BUCKET_NAME/$(echo "$MAC_SILICON_FILE" | sed 's/ /%20/g')",
  "macIntel": "$MINIO_URL/$BUCKET_NAME/$(echo "$MAC_INTEL_FILE" | sed 's/ /%20/g')",
  "windows": "$MINIO_URL/$BUCKET_NAME/$(echo "$WINDOWS_FILE" | sed 's/ /%20/g')"
}
EOF

# Copy to the generic downloads.json for the landing page to consume by default
cp landing/public/downloads_v$VERSION.json landing/public/downloads.json

echo "✅ Đã tải file lên hoàn tất và tạo xong downloads_v$VERSION.json! Cập nhật liên kết thành công."
