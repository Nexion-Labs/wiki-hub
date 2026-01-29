import { db } from '../client';
import { eolCategories } from '../schema/eol';

const INITIAL_CATEGORIES = [
    { code: 'programming-language', name: 'Ngôn ngữ lập trình', icon: '💻', description: 'Programming languages like Java, Python, TS' },
    { code: 'framework', name: 'Framework', icon: '🏗️', description: 'Web/App frameworks like React, Vue, Spring' },
    { code: 'database', name: 'Cơ sở dữ liệu', icon: '🗄️', description: 'SQL, NoSQL databases' },
    { code: 'runtime', name: 'Runtime', icon: '⚙️', description: 'Runtimes like Node.js, Deno, Bun' },
    { code: 'os', name: 'Hệ điều hành', icon: '🖥️', description: 'Operating Systems like Ubuntu, Windows' },
    { code: 'library', name: 'Thư viện', icon: '📚', description: 'Libraries and Packages' },
    { code: 'tool', name: 'Công cụ', icon: '🔧', description: 'DevOps tools, IDEs, etc.' },
    { code: 'cloud', name: 'Dịch vụ Cloud', icon: '☁️', description: 'AWS, Azure, GCP services' },
    { code: 'default', name: 'Khác', icon: '📦', description: 'Other product types' },
];

export async function seedEOLCategories() {
    console.log('🌱 Seeding EOL categories...');

    for (const category of INITIAL_CATEGORIES) {
        try {
            await db.insert(eolCategories).values(category).onConflictDoNothing();
        } catch (error) {
            console.error(`Error seeding category ${category.code}:`, error);
        }
    }

    console.log('✅ EOL categories seeded');
}
