import { motion } from "framer-motion";
import { Award, Clock, Heart, Users } from "lucide-react";
import React from "react";

const About: React.FC = () => {
  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            About GreenLean
          </motion.h1>
          <motion.p
            className="text-lg text-foreground/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We're on a mission to make personalized nutrition and fitness accessible to everyone,
            empowering you to take control of your health journey.
          </motion.p>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-foreground/80 mb-4">
              GreenLean was born from a simple observation: health and wellness advice is often
              generic, overwhelming, and inaccessible to many people.
            </p>
            <p className="text-foreground/80 mb-4">
              We believe that everyone deserves personalized guidance for their unique health
              journey. Our team of nutrition experts, fitness professionals, and health enthusiasts
              came together to create a platform that delivers customized plans without the premium
              price tag.
            </p>
            <p className="text-foreground/80">
              Today, GreenLean helps thousands of people discover diet and fitness approaches
              tailored to their specific needs, goals, and preferences—all completely free.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative h-80 rounded-xl overflow-hidden"
          >
            <img
              src="https://images.pexels.com/photos/3823207/pexels-photo-3823207.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Our team"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              These core principles guide everything we do at GreenLean.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
            {[
              {
                icon: <Users className="h-8 w-8 text-green-500" />,
                title: "Personalization",
                description:
                  "We believe in tailored approaches that consider your unique needs, preferences, and goals.",
              },
              {
                icon: <Award className="h-8 w-8 text-blue-500" />,
                title: "Scientific Integrity",
                description:
                  "Our recommendations are based on current scientific research and evidence-based practices.",
              },
              {
                icon: <Heart className="h-8 w-8 text-red-500" />,
                title: "Inclusivity",
                description:
                  "We create resources that are accessible to everyone, regardless of fitness level or background.",
              },
              {
                icon: <Clock className="h-8 w-8 text-purple-500" />,
                title: "Sustainability",
                description:
                  "We focus on long-term health rather than quick fixes that don't last.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                className="bg-card p-6 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="rounded-full bg-background/60 w-16 h-16 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-foreground/80">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
