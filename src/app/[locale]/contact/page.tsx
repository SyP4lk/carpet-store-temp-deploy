import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import { use } from "react";
import { getDictionary } from "@/localization/dictionary";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Share2,
} from "lucide-react";
import Script from "next/script";

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const iconMap: Record<string, React.ElementType> = {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle: WhatsAppIcon,
  Share2,
};

const Contact = () => {
  const dict = use(getDictionary());

  return (
    <div className="flex flex-col">
      <Banner filter="Contact" image="/static/image1.png" />

      <section className="px-6 md:px-24 py-12 bg-white text-gray-800">
        <div className="max-w-4xl mx-auto divide-y divide-gray-300">
          {/* Address */}
          <div className="flex items-start gap-10 py-6">
            <MapPin className="w-6 h-6 text-gray-600 shrink-0" />
            <h3 className="font-semibold text-sm uppercase">
              {dict.contacts.Address.name}
            </h3>
            <div>
              <p className="text-sm mt-1">{dict.contacts.Address.value}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-10 py-6">
            <Phone className="w-6 h-6 text-gray-600 shrink-0" />
            <h3 className="font-semibold text-sm uppercase">
              {dict.contacts.Phone.name}
            </h3>
            <div>
              <a
                href={`tel:${dict.contacts.Phone.value}`}
                className="text-sm mt-1 text-blue-600 hover:underline"
              >
                {dict.contacts.Phone.value}
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-10 py-6">
            <Mail className="w-6 h-6 text-gray-600 shrink-0" />
            <h3 className="font-semibold text-sm uppercase">
              {dict.contacts["E-Mail"].name}
            </h3>
            <div>
              <a
                href={`mailto:${dict.contacts["E-Mail"].value}`}
                className="text-sm mt-1 text-blue-600 hover:underline"
              >
                {dict.contacts["E-Mail"].value}
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-start gap-10 py-6">
            <WhatsAppIcon className="w-6 h-6 text-gray-600 shrink-0" />
            <h3 className="font-semibold text-sm uppercase">
              {dict.contacts.WhatsApp.name}
            </h3>
            <div>
              <a
                href={`https://wa.me/${dict.contacts.WhatsApp.value.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 mt-1 hover:underline"
              >
                {dict.contacts.WhatsApp.value}
              </a>
            </div>
          </div>

          {/* Instagram */}
          <div className="flex items-start gap-10 py-6">
            <Instagram className="w-6 h-6 text-gray-600 shrink-0" />
            <h3 className="font-semibold text-sm uppercase">
              {dict.contacts.Instagram.name}
            </h3>
            <div>
              <a
                href={`https://instagram.com/${dict.contacts.Instagram.value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm mt-1 text-blue-600 hover:underline"
              >
                @{dict.contacts.Instagram.value}
              </a>
            </div>
          </div>

          {/* Social media map */}
          <div className="flex items-start gap-10 py-6">
            <Share2 className="w-6 h-6 text-gray-600 shrink-0" />
            <h3 className="font-semibold text-sm uppercase">
              {dict.contacts.social.label}
            </h3>
            <div className="flex items-center gap-6 flex-wrap">
              {dict.contacts.social.value.map((social: any, i: number) => {
                const SocialIcon = iconMap[social.platform] || Share2;
                return (
                  <a
                    key={i}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                  >
                    <SocialIcon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Yandex Map */}
      <iframe
        src="https://yandex.ru/map-widget/v1/?um=constructor%3A6c10b516473bd8e3336e1d0ce529ccf5aa08dce0c2438ecf2eeff8ab484ad83c&source=constructor"
        width="100%"
        className="aspect-video"
        style={{ border: 0 }}
        
        loading="lazy"
      ></iframe>

      <Footer />

    </div>
  );
};

export default Contact;
