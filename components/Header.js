import Link from 'next/link';
import { useRouter } from 'next/router'
import { useSuffix } from '../hooks';

export default function Header(props) {

    const router = useRouter();

    const [suffix, suffixFull] = useSuffix();

    return (
        <header className="flex p-4 items-center justify-between">
            <div className="flex items-center justify-start">
                <Link href="/" >
                    <a>
                        <img src="/polkaview-logo.png" className="w-56" />
                    </a>
                </Link>
            </div>
            <div className="text-right flex justify-end">
                <Link href={suffix === 'dot' ? router.asPath.replace(`/dot`, `/ksm`) : router.asPath.replace(`/ksm`, `/dot`)} >
                    <a className={`text-${suffix === 'dot' ? 'ksm' : 'dot'} mb-2 text-right`} >
                        <span className="text-gray-500">switch to </span> {suffix === 'dot' ? 'kusama' : 'polkadot'}
                    </a>
                </Link>
            </div>
        </header>
    );

};