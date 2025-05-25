use std::path::Path;

use axum::body::Bytes;
use image::{ImageError, ImageFormat, ImageReader, DynamicImage, RgbaImage, RgbImage};
use image::error::{ImageFormatHint, UnsupportedError, UnsupportedErrorKind};
use image::imageops::FilterType;
use image::io::Reader;
use image_hasher::{Hasher, HasherConfig};

use common::entities::ImageSize;

pub struct ImageManager<Q: AsRef<Path>> {
    path: Q,
    hasher: Hasher,
}

impl<Q> ImageManager<Q>
where Q: AsRef<Path>
{
    pub fn new(path: Q) -> Self {
        Self {
            path,
            hasher: HasherConfig::new().to_hasher(),
        }
    }

    pub async fn get_image(&self, size: ImageSize, format: &str) -> Result<Vec<u8>, ImageError> {
        let format = ImageFormat::from_extension(format)
            .ok_or(ImageError::Unsupported(UnsupportedError::from_format_and_kind(
                ImageFormatHint::Unknown,
                UnsupportedErrorKind::Format(ImageFormatHint::Unknown),
            )))?;

        let dimensions = size.dimensions();
        let mut image = ImageReader::open(&self.path)?
            .with_guessed_format()?
            .decode()?
            .resize(dimensions.0 as u32, dimensions.1 as u32, FilterType::Gaussian);
        
        if matches!(format, ImageFormat::Jpeg) {
            image = match image {
                DynamicImage::ImageRgba8(rgba_img) =>
                    DynamicImage::ImageRgb8(from_rgba_to_rgb(rgba_img)),
                DynamicImage::ImageRgba16(rgba_img) => {
                    DynamicImage::ImageRgb8(
                        image::ImageBuffer::from_fn(rgba_img.width(), rgba_img.height(), |x, y| {
                            let rgba = rgba_img.get_pixel(x, y);
                            let alpha = rgba[3] as f32 / 65535.0;
                            let inv_alpha = 1.0 - alpha;

                            let r = ((rgba[0] as f32 / 65535.0 * alpha + inv_alpha) * 255.0) as u8;
                            let g = ((rgba[1] as f32 / 65535.0 * alpha + inv_alpha) * 255.0) as u8;
                            let b = ((rgba[2] as f32 / 65535.0 * alpha + inv_alpha) * 255.0) as u8;

                            image::Rgb([r, g, b])
                        })
                    )
                },
                DynamicImage::ImageLumaA8(luma_alpha_img) => {
                    DynamicImage::ImageRgb8(
                        image::ImageBuffer::from_fn(luma_alpha_img.width(), luma_alpha_img.height(), |x, y| {
                            let la = luma_alpha_img.get_pixel(x, y);
                            let alpha = la[1] as f32 / 255.0;
                            let inv_alpha = 1.0 - alpha;

                            let gray = (la[0] as f32 * alpha + 255.0 * inv_alpha) as u8;
                            image::Rgb([gray, gray, gray])
                        })
                    )
                },
                DynamicImage::ImageLumaA16(luma_alpha_img) => {
                    DynamicImage::ImageRgb8(
                        image::ImageBuffer::from_fn(luma_alpha_img.width(), luma_alpha_img.height(), |x, y| {
                            let la = luma_alpha_img.get_pixel(x, y);
                            let alpha = la[1] as f32 / 65535.0;
                            let inv_alpha = 1.0 - alpha;

                            let gray = ((la[0] as f32 / 65535.0 * alpha + inv_alpha) * 255.0) as u8;
                            image::Rgb([gray, gray, gray])
                        })
                    )
                },
                _ => image
            };
        }

        let mut buffer = std::io::Cursor::new(Vec::new());
        image.write_to(&mut buffer, format)?;

        Ok(buffer.into_inner())
    }

    pub async fn create_image(&mut self, origin_format: &str, data: Bytes, thumb: u32) -> Result<String, ImageError> {
        let format = ImageFormat::from_extension(origin_format)
            .ok_or(ImageError::Unsupported(UnsupportedError::from_format_and_kind(
                ImageFormatHint::Unknown,
                UnsupportedErrorKind::Format(ImageFormatHint::Unknown),
            )))?;

        let image = Reader::new(std::io::Cursor::new(data))
            .with_guessed_format()?;

        let mut image = image.decode()?;
        image = image.thumbnail(thumb, thumb);
        
        if matches!(format, ImageFormat::Jpeg) {
            image = match image {
                DynamicImage::ImageRgba8(rgba_img) =>
                    DynamicImage::ImageRgb8(from_rgba_to_rgb(rgba_img)),
                _ => image
            };
        }

        let hash = self.hasher.hash_image(&image).to_base64()
            .replace("/", "⁄");
        image.save_with_format(
            self.path.as_ref().join(&hash),
            format,
        )?;

        Ok(hash)
    }
}

fn from_rgba_to_rgb(rgba_img: RgbaImage) -> RgbImage {
    image::ImageBuffer::from_fn(rgba_img.width(), rgba_img.height(), |x, y| {
        let rgba = rgba_img.get_pixel(x, y);
        let alpha = rgba[3] as f32 / 255.0;
        let inv_alpha = 1.0 - alpha;

        let r = (rgba[0] as f32 * alpha + 255.0 * inv_alpha) as u8;
        let g = (rgba[1] as f32 * alpha + 255.0 * inv_alpha) as u8;
        let b = (rgba[2] as f32 * alpha + 255.0 * inv_alpha) as u8;

        image::Rgb([r, g, b])
    })
}