import argparse
import asyncio
import secrets
import string

from app.core import db, security, users


async def create_admin_user(name, email, password) -> str:
    if password is None:
        alphabet = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(secrets.choice(alphabet) for i in range(32))

    hashed_password = security.hash_password(password)
    user = users.User(
        name = name,
        email = email,
        hashed_password = hashed_password,
        admin = True
    )
    async with db.get_session() as session:
        session.add(user)
        await session.commit()
    
    return password



if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog='create-admin-user', usage='%(prog)s [options]')
    parser.add_argument('--name', '-n', default = 'Admin')
    parser.add_argument('--email', '-e', default = 'admin@windjournal.com')
    parser.add_argument('--password', '-p')
    args = parser.parse_args()

    print(asyncio.run(create_admin_user(**vars(args))))